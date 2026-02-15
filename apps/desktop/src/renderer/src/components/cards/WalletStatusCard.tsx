/**
 * WalletStatusCard — Top-right connect/status pill using the provided SVG shape.
 * Shows "Connect" when disconnected, "Wrong Net" (orange) on wrong chain,
 * or truncated address with green dot when connected on correct network.
 */
import { useWallet } from '../../contexts/WalletContext';
import { FONT_HEADING } from '../../utils/tokens';
import { slideIn } from '../../styles/theme';

function shortenAddr(addr: string): string {
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function WalletStatusCard() {
    const { account, isConnected, isWrongNetwork, connect, disconnect, switchChain } = useWallet();

    const label = isWrongNetwork ? 'Wrong Net' : (isConnected && account ? shortenAddr(account) : 'Connect');

    const handleClick = async () => {
        if (isWrongNetwork) {
            await switchChain(5611);
        } else if (isConnected) {
            await disconnect();
        } else {
            await connect();
        }
    };

    // Orange tones for wrong network, red/coral for normal
    const blobFill = isWrongNetwork ? '#E6A33E' : '#EE5F5E';
    const bodyFill = isWrongNetwork ? '#F0B24A' : '#FA6D75';

    return (
        <div
            onClick={handleClick}
            style={{
                cursor: 'pointer',
                position: 'relative',
                animation: slideIn(0.15),
                transition: 'transform 0.25s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.06)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
            <svg
                width="207"
                height="100"
                viewBox="0 0 207 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: 'block' }}
            >
                {/* Blob behind card */}
                <g filter="url(#filter0_wallet)">
                    <path
                        d="M108.378 58.5033C108.378 58.5033 107.517 75.9977 53.0333 80.6802C-1.45064 85.3627 -6.02811 45.4368 37.6794 19.8591C81.3869 -5.71853 128.665 18.6618 149.71 31.2195C170.754 43.7771 108.378 58.5033 108.378 58.5033Z"
                        fill={blobFill}
                    />
                </g>

                {/* Card body */}
                <g filter="url(#filter1_wallet)">
                    <path
                        d="M19.3438 40.6451C19.3438 22.7478 34.5682 8.68657 52.4376 9.68638C89.5264 11.7616 118.902 11.8253 155.994 9.73538C173.835 8.73021 189.06 22.7519 189.06 40.6206C189.06 59.1514 172.743 73.4789 154.294 71.7319C139.271 70.3092 121.92 69.0169 107.72 68.9197C91.6474 68.8098 71.2476 70.2685 54.0979 71.8508C35.6324 73.5545 19.3438 59.189 19.3438 40.6451Z"
                        fill={bodyFill}
                    />
                </g>

                {/* Status dot + label */}
                {isConnected && !isWrongNetwork && (
                    <circle cx="68" cy="40" r="4" fill="#90B171" />
                )}
                <text
                    x="104"
                    y="46"
                    fontFamily={FONT_HEADING}
                    fontWeight="800"
                    fontSize="20"
                    fill="white"
                    textAnchor="middle"
                >
                    {label}
                </text>

                <defs>
                    <filter id="filter0_wallet" x="0.75625" y="4.22695" width="170.691" height="97.2307" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                        <feOffset dx="5" dy="8" />
                        <feGaussianBlur stdDeviation="6.2" />
                        <feComposite in2="hardAlpha" operator="out" />
                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
                    </filter>
                    <filter id="filter1_wallet" x="11.8438" y="7.13574" width="194.715" height="87.3525" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                        <feOffset dx="5" dy="10" />
                        <feGaussianBlur stdDeviation="6.25" />
                        <feComposite in2="hardAlpha" operator="out" />
                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
                    </filter>
                </defs>
            </svg>
        </div>
    );
}
