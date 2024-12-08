import React, { useState } from "react";
import { MdContentCopy } from "react-icons/md";
import "./styles.css";

const CopyToClipboard = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);

    const handleClick = async () => {
        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            // Reset copied state after 1 seconds
            setTimeout(() => setCopied(false), 1000);
        } catch (err) {
            console.error("Failed to copy: ", err);
        }
    };

    return (
        <div>
            <button className="copyToClipboard" onClick={handleClick}>
                {copied ? (
                    <div className="colorGreenLight copiedText">Copied!</div>
                ) : (
                    <MdContentCopy size={18} color="#ddd" />
                )}
            </button>
        </div>
    );
};

export default CopyToClipboard;
