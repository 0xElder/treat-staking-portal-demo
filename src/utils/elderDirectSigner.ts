import { encodeSecp256k1Signature, rawSecp256k1PubkeyToRawAddress } from "@cosmjs/amino";
import { Secp256k1, sha256 } from "@cosmjs/crypto";
import { toBech32 } from "@cosmjs/encoding";
import { AccountData, DirectSignResponse, OfflineDirectSigner, makeSignDoc, makeSignBytes } from "@cosmjs/proto-signing"
import { SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { ethers } from "ethers";
import { PubKey } from "../app/pages/Home/components/Staking/elder_proto/crypto/ethsecp256k1/keys.ts";

declare var window: any

function convertSignatureTo64ByteUint8Array(signature: string): Uint8Array {
    // Remove '0x' prefix if present
    if (signature.startsWith('0x')) {
        signature = signature.slice(2);
    }

    // Ensure signature length is correct (65 bytes in hex = 130 characters)
    if (signature.length !== 130) {
        throw new Error("Signature length must be 65 bytes (130 hex characters)");
    }

    // Extract r and s from the signature
    const rHex = signature.slice(0, 64); // First 32 bytes in hex
    const sHex = signature.slice(64, 128); // Next 32 bytes in hex

    // Convert hex to bytes for r and s
    const rBytes = new Uint8Array(32);
    const sBytes = new Uint8Array(32);
    
    for (let i = 0; i < 32; i++) {
        rBytes[i] = parseInt(rHex.substr(i * 2, 2), 16);
        sBytes[i] = parseInt(sHex.substr(i * 2, 2), 16);
    }

    // Concatenate r and s into a single Uint8Array
    const result = new Uint8Array(64);
    result.set(rBytes);
    result.set(sBytes, 32);

    return result;
}

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
        console.log("pubkey:", this.pubkey);
        console.log("rawSecp256k1PubkeyToRawAddress(this.pubkey):", rawSecp256k1PubkeyToRawAddress(this.pubkey));
        console.log("prefix: ", this.prefix)
        console.log("toBech32(this.prefix, rawSecp256k1PubkeyToRawAddress(this.pubkey)):", toBech32(this.prefix, rawSecp256k1PubkeyToRawAddress(this.pubkey)));
        // return toBech32(this.prefix, "1383221e7255514256841157De0753cAf2FDa573");
        return "elder1zwpjy8nj24g5y45yz9taup6nete0mftn6q30qk"
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
        console.log("this.address ", this.address)
        if (address !== this.address) {
            throw new Error(`Address ${address} not found in wallet`);
        }
        // const hashedMessage = sha256(signBytes);
        // const signature = await Secp256k1.createSignature(hashedMessage, this.privkey);

        const [account] = await window.ethereum.request({
            method: "eth_accounts",
        });
        // Sign with MetaMask
                
        const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [Buffer.from(signBytes).toString("hex"), account]
        });

        //verify signatur


        const signatureBytes = convertSignatureTo64ByteUint8Array(signature);
        // const pubkey = PubKey.encode(PubKey.fromPartial({
        //     key: this.pubkey,
        // })).finish()
        const stdSignature = encodeSecp256k1Signature(this.pubkey, signatureBytes);
        return {
            signed: signDoc,
            signature: stdSignature,
        };
    }
}

// {"0":70,"1":51,"2":198,"3":22,"4":12,"5":224,"6":233,"7":115,"8":132,"9":188,"10":189,"11":19,"12":89,"13":193,"14":13,"15":41,"16":143,"17":227,"18":224,"19":115,"20":169,"21":212,"22":170,"23":100,"24":247,"25":199,"26":52,"27":149,"28":77,"29":226,"30":168,"31":161}
// {"0":70,"1":51,"2":198,"3":22,"4":12,"5":224,"6":233,"7":115,"8":132,"9":188,"10":189,"11":19,"12":89,"13":193,"14":13,"15":41,"16":143,"17":227,"18":224,"19":115,"20":169,"21":212,"22":170,"23":100,"24":247,"25":199,"26":52,"27":149,"28":77,"29":226,"30":168,"31":161}
// {"0":70,"1":51,"2":198,"3":22,"4":12,"5":224,"6":233,"7":115,"8":132,"9":188,"10":189,"11":19,"12":89,"13":193,"14":13,"15":41,"16":143,"17":227,"18":224,"19":115,"20":169,"21":212,"22":170,"23":100,"24":247,"25":199,"26":52,"27":149,"28":77,"29":226,"30":168,"31":161}
// {"0":70,"1":51,"2":198,"3":22,"4":12,"5":224,"6":233,"7":115,"8":132,"9":188,"10":189,"11":19,"12":89,"13":193,"14":13,"15":41,"16":143,"17":227,"18":224,"19":115,"20":169,"21":212,"22":170,"23":100,"24":247,"25":199,"26":52,"27":149,"28":77,"29":226,"30":168,"31":161}
// {"0":66,"1":233,"2":119,"3":47,"4":202,"5":118,"6":9,"7":218,"8":21,"9":79,"10":224,"11":220,"12":85,"13":0,"14":154,"15":237,"16":141,"17":201,"18":191,"19":105,"20":169,"21":133,"22":135,"23":82,"24":90,"25":111,"26":8,"27":57,"28":240,"29":86,"30":192,"31":10}