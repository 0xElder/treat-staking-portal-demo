import { encodeSecp256k1Signature, rawSecp256k1PubkeyToRawAddress } from "@cosmjs/amino";
import { Secp256k1, sha256 } from "@cosmjs/crypto";
import { toBech32 } from "@cosmjs/encoding";
import { AccountData, DirectSignResponse, OfflineDirectSigner, makeSignDoc, makeSignBytes } from "@cosmjs/proto-signing"
import { SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx";

declare var window: any

export class ElderDirectSecp256k1Wallet implements OfflineDirectSigner {
    /**
     * Creates a DirectSecp256k1Wallet from the given public key
     *
     * @param privkey The private key.
     * @param prefix The bech32 address prefix (human readable part). Defaults to "cosmos".
     */
    public static async fromCompressedPublicKey(compressedPubkey: Uint8Array, prefix = "elder"): Promise<ElderDirectSecp256k1Wallet> {
        return new ElderDirectSecp256k1Wallet(compressedPubkey, prefix);
    }

    public static async fromUncompressedPublicKey(uncompressedPubkey: Uint8Array, prefix = "elder"): Promise<ElderDirectSecp256k1Wallet> {
        return new ElderDirectSecp256k1Wallet(Secp256k1.compressPubkey(uncompressedPubkey), prefix);
    }

    private readonly pubkey: Uint8Array;
    private readonly prefix: string;

    private constructor(compressedPubkey: Uint8Array, prefix: string) {
        this.pubkey = compressedPubkey;
        this.prefix = prefix;
    }

    private get address(): string {
        return toBech32(this.prefix, rawSecp256k1PubkeyToRawAddress(this.pubkey));
    }

    public async getAccounts(): Promise<readonly AccountData[]> {
        return [
            {
                algo: "secp256k1",
                address: this.address,
                pubkey: this.pubkey,
            },
        ];
    }

    public async signDirect(address: string, signDoc: SignDoc): Promise<DirectSignResponse> {
        const signBytes = makeSignBytes(signDoc);
        if (address !== this.address) {
            throw new Error(`Address ${address} not found in wallet`);
        }
        const hashedMessage = sha256(signBytes);
        // const signature = await Secp256k1.createSignature(hashedMessage, this.privkey);

        const [account] = await window.ethereum.request({
            method: "eth_accounts",
        });
        // Sign with MetaMask
        const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [JSON.stringify(hashedMessage), account]
        });

        console.log("Signature:", signature);

        const signatureBytes = new Uint8Array([...signature.r(32), ...signature.s(32)]);
        const stdSignature = encodeSecp256k1Signature(this.pubkey, signatureBytes);
        return {
            signed: signDoc,
            signature: stdSignature,
        };
    }
}
