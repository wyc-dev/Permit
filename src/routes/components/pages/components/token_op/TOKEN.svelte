<script>
    import { onMount, onDestroy } from "svelte";
    import { ethers } from "ethers";
    import { fade, scale, slide, blur } from "svelte/transition";
    import TOKEN_logo from "../tokens/TOKEN.png";
    import DEPOSIT from "../tokens/1.png";
    import SPEND from "../tokens/2.png";
    import { Provider, merchant, User_TOKEN, recentSpends, recentDeposits, UserETH, TOKENSupply, TOKENMinted, TOKENBurnt, BASE, SCAN, lang, TOKENContractAddress, TOKENABI } from '../../../../store.js';
    import QrcodeDecoder from "qrcode-decoder";
    import INFO_table from "./tool_parts/token_info_table.svelte";
    import TX_table from "./tool_parts/tx_record.svelte";
    import Merchants from "./tool_parts/merchant_list.svelte";
    import BackButton from "./tool_parts/BackButton.svelte";
    import Load from "./tool_parts/loading/loading.svelte";
    export let coin_name;
    export let user_address;
    let insufficientBalance = false;
    let errorTimeout = null;
    let lastTxHash;
    let Hash;
    let isLoading = true;
    let merchantInfo;
    let showMerchants = false;
    let operation = "INFO";
    let op_color = "#CCCCCC";
    $: linkColor = op_color;
    // $: description2 =
    //     coin_name === "TOKEN"
    //         ? ($lang === "ZH" ? "* 這裡的總流通量已扣除去中心化 LP 中的代幣數量" : "* Circulatiing Supply here already minus the number of tokens in the decentralized LP.")
    //         : "";
    let amount = 0;
    import QRCode from "qrcode-svg";
    import Bg from "../assets/ton_invest_power_bg.mp4";
    import TxBg from "../assets/tx.mp4";
    import ID from "../assets/DID.mp4";
    import Keyboard from "../assets/keyboard.svelte";
    import Guide from "../assets/guide.svelte";
    import Blocks from "../assets/blocks.svelte";
    import US from "../assets/US.png";
    let buttons = [
        { component: Keyboard, index: 0, name: ($lang === "ZH" ? "轉賬操作" : "Transfer") },
        { component: Blocks, index: 1, name: ($lang === "ZH" ? "歷史紀錄" : "History") },
        { component: Guide, index: 2, name: ($lang === "ZH" ? "流程說明" : "Guide") }
    ];
    let selectedIndex = 0;
    let scanning = false;
    let videoStream = null;
    let videoElement = null;
    let qrSvg = null;
    let qrDecoder = new QrcodeDecoder();
    import jsQR from "jsqr";

    const MAX_SCAN_TIME = 30 * 1000;
    let scanStartTime = 0;

    const vibrationPatterns = {
        success: [100, 30, 100],
        process: [200],
        error: [500, 100, 200]
    };

    function handleNumClick(value) {
        if (value === "0" && (amount === 0 || amount === "0")) {
            return;
        } else if (amount === 0 || amount === "0") {
            amount = value;
            return;
        }
        amount += value;
    }

    function handleBackspace() {
        // if (amount !== 0){
        //     amount = amount.slice(0, -1);
        // } else {
            amount = 0;
        //}
    }

    const BLACK_HOLE_ADDRESS = "0x0000000000000000000000000000000000000000";

    function openUniswapTab() {
        window.open(`https://app.uniswap.org/swap?inputCurrency=0x833589fcd6edb6e08f4c7c32d4f71b54bda02913&outputCurrency=${$TOKENContractAddress}&chain=base`, '_blank');
    }

    async function fetchTokenTransactions(type) {
        try {
            const url = new URL("https://api.basescan.org/api");
            url.search = new URLSearchParams({
                module: "account",
                action: "tokentx",
                contractaddress: $TOKENContractAddress,
                address: user_address,
                page: 1,
                offset: 100,
                sort: "desc",
                apikey: $SCAN
            });

            const response = await fetch(url);
            const data = await response.json();

            return data.result
                .filter(tx => {
                    if (type === "DEPOSIT") {
                        return tx.from.toLowerCase() === BLACK_HOLE_ADDRESS;
                    }
                    if (type === "SPEND") {
                        return tx.to.toLowerCase() === BLACK_HOLE_ADDRESS;
                    }
                    return false;
                })
                .slice(0, 5)
                .map(tx => formatTransaction(tx, type));
        } catch (error) {
            return [];
        }
    }

    function formatTransaction(tx, type) {
        const isDeposit = type === "DEPOSIT";
        return {
            type: type,
            amount: ethers.formatUnits(tx.value, 18),
            timestamp: new Date(parseInt(tx.timeStamp) * 1000).toLocaleString(),
            txHash: tx.hash,
            counterparty: isDeposit ? tx.to : tx.from,
            direction: isDeposit ? "←" : "→",
            gasUsed: `${ethers.formatUnits(tx.gasUsed, 9)} Gwei`,
            status: parseInt(tx.confirmations) > 12 ? "Confirmed" : "Pending"
        };
    }

    async function getRecentDeposits() {
        if ($recentDeposits.length === 0) {
            const Deposits = await fetchTokenTransactions("DEPOSIT");
            recentDeposits.set(Deposits);
        }
    }

    // Fixed getRecentSpends function
    async function getRecentSpends() {
        if ($recentSpends.length === 0) {
            const Spends = await fetchTokenTransactions("SPEND");
            recentSpends.set(Spends);
        }
    }

    async function updateBalance() {
        try {
            const response = await fetch(`https://api.basescan.org/api?module=account&action=tokenbalance&contractaddress=${$TOKENContractAddress}&address=${user_address}&tag=latest&apikey=5IHYR92H2XEWMV44WI1HNIY9YSHFM4SA2B`);
            const data = await response.json();
            if (data.status !== "1") {
                return false;
            }
            const apiBalance = parseFloat(ethers.formatUnits(data.result, 18));
            const balanceDiff = Math.abs(apiBalance - $User_TOKEN);
            try {
                if (Math.abs(balanceDiff - amount) < 0.1 && round(apiBalance, 2) !== round($User_TOKEN, 2)) {
                    await Promise.all([
                        getRecentDeposits(),
                        getRecentSpends(),
                    ]);
                    updateLinkColor("#22FF22");
                    lastTxHash = `${operation === "DEPOSIT" ? "Received" : "Paid"} ${formatVolume(amount, 2)} ${coin_name}`;
                    setTimeout(() => {
                        operation = "INFO";
                        amount = 0;
                        qrSvg = null;
                        lastTxHash = "";
                    }, 5000);
                    $User_TOKEN = apiBalance;
                    return true;
                }
            } catch (contractError) {
            }
        } catch (error) {
            stopChecking();
            return false;
        }
    }

    let checkInterval = null;

    function startChecking() {
        if (checkInterval) clearInterval(checkInterval);
        checkInterval = setInterval(async () => {
            const found = await updateBalance();
        }, 1500);
    }

    function stopChecking() {
        if (checkInterval) clearInterval(checkInterval);
        clearInterval(checkInterval);
    }

    function handleButtonClick() {
        if (operation === "SPEND" && amount > $User_TOKEN) {
            insufficientBalance = true;
            if (errorTimeout) clearTimeout(errorTimeout);
            errorTimeout = setTimeout(() => {
                qrSvg = null;
                insufficientBalance = false;
                amount = 0;
            }, 600);
        } else {
            action();
            if (!$merchant && qrSvg && amount) {
                startChecking();
            } else {
                stopChecking();
            }
        }
    }

    async function decodeQRCodeLoop() {
        scanStartTime = Date.now();
        while (scanning && merchantInfo.isFrozen === false && (Date.now() - scanStartTime < MAX_SCAN_TIME)) {
            try {
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                canvas.width = videoElement.videoWidth;
                canvas.height = videoElement.videoHeight;
                context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);

                if (code && code.data) {
                    const jsonData = JSON.parse(code.data);
                    await parseScannedData(jsonData);
                    stopCamera();
                    break;
                }
            } catch (err) {
                if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
                    await new Promise(resolve => setTimeout(resolve, 200)); // 0.2 秒重新 scan多次
                    continue;
                }
            }
            await new Promise(resolve => setTimeout(resolve, 200)); // 0.2 秒重新 scan多次
            if (!videoStream) {
                stopCamera();
                break;
            }
        }
    }

    async function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const image = new Image();
            image.onload = async () => {
                const canvas = document.createElement("canvas");
                canvas.width = image.width;
                canvas.height = image.height;
                const context = canvas.getContext("2d");
                context.drawImage(image, 0, 0, canvas.width, canvas.height);
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);

                if (code && code.data) {
                    const jsonData = JSON.parse(code.data);
                    await parseScannedData(jsonData);
                }
            };
            image.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    async function parseScannedData(data) {
        try {
            const parsedData = typeof data === "string" ? JSON.parse(data) : data;
            const amountWei = ethers.parseUnits(parsedData.amount.toString(), 18);

            if (parsedData.operation === 0) {
                await SPENDTOKEN(parsedData.target, amountWei);
            } else if (parsedData.operation === 1) {
                await DEPOSITTOKEN(parsedData.target, amountWei);
            }
        } catch (err) {
            lastTxHash = "Transaction canceled ";
        }
    }

    async function DEPOSITTOKEN(target, amount) {
        lastTxHash = $lang === "EN" ? "Approving Operation" : "簽署核准增值操作";
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const TOKEN_tx = new ethers.Contract($TOKENContractAddress, $TOKENABI, signer);
            const tx = await TOKEN_tx.mintToken(target, amount);
            const amountReg = ethers.toQuantity(amount);
            lastTxHash = `${$lang === "EN" ? "Adding " : "正在增值 "} ${formatVolume(amountReg / 10 ** 18, 2)} ${coin_name}`;
            updateLinkColor("#FFD700");
            await tx.wait();
            Hash = tx.hash;
            lastTxHash = $lang === "EN" ? "Operation Confirmed" : "增值操作已完成";
            updateLinkColor("#22FF22");
            stopCamera();
        } catch (error) {
                if (!$UserETH) {
                  lastTxHash = $lang === "EN" ? "Deposit ETH for Gas" : "存入 ETH 繳付鏈上費用";
                  updateLinkColor("#FF2222");
                    stopCamera();
                } else {
                  lastTxHash = $lang === "EN" ? "Transaction Canceled" : "操作交易已取消";
                  updateLinkColor("#FF2222");
                    stopCamera();
                }
        } finally {
            stopCamera();
            await Promise.all([
                // getRecentDeposits(), // 因為是商戶使用，所以不需要 fetch 這兩個
                // getRecentSpends(),
                fetchTOKENStats(),
                new Promise((resolve) => {
                    setTimeout(() => resolve(fetchMerchantStatus()), 200);
                }),
            ]);
            operation = "INFO";
            op_color = "#CCCCCC";
            setTimeout(() => {
                lastTxHash = "";
                updateLinkColor("#FFD700");
            }, 5000);
        }
    }

    async function SPENDTOKEN(target, amount) {
        lastTxHash = $lang === "EN" ? "Approving Operation" : "簽署核准收費操作";
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const TOKEN_tx = new ethers.Contract($TOKENContractAddress, $TOKENABI, signer);
            const tx = await TOKEN_tx.payMerchant(target, amount);
            const amountReg = ethers.toQuantity(amount);
            lastTxHash = `${$lang === "EN" ? "Receiving " : "正在收取 "} ${formatVolume(amountReg / 10 ** 18, 2)} ${coin_name}`;
            updateLinkColor("#FFD700");
            await tx.wait();
            Hash = tx.hash;
            lastTxHash = $lang === "EN" ? "Operation Confirmed" : "收費操作已完成";
            updateLinkColor("#22FF22");
            stopCamera();
        } catch (error) {
                if (!$UserETH) {
                  lastTxHash = $lang === "EN" ? "Deposit ETH for Gas" : "存入 ETH 繳付鏈上費用";
                  updateLinkColor("#FF2222");
                    stopCamera();
                } else {
                  lastTxHash = $lang === "EN" ? "Transaction Canceled" : "操作交易已取消";
                  updateLinkColor("#FF2222");
                    stopCamera();
                }
        } finally {
            stopCamera();
            await Promise.all([
                // getRecentDeposits(), // 因為是商戶使用，所以不需要 fetch 這兩個
                // getRecentSpends(),
                fetchTOKENStats(),
                new Promise((resolve) => {
                    setTimeout(() => resolve(fetchMerchantStatus()), 200);
                }),
            ]);
            operation = "INFO";
            op_color = "#CCCCCC";
            setTimeout(() => {
                lastTxHash = "";
                updateLinkColor("#FFD700");
            }, 5000);
        }
    }

    let fill = "white";

    function updateLinkColor(color) {
        fill = color;
        const linkElement = document.querySelector(".tx-hash-link");
        if (linkElement) {
            linkElement.style.color = color;
        }
    }

    function stopCamera() {
        if (videoStream) {
            videoStream.getTracks().forEach(track => {
                track.stop();
                track.enabled = false;
                track = null;
            });
            videoStream = null;
        }
        if (videoElement) {
            videoElement.srcObject = null;
            videoElement.pause();
            videoElement.removeAttribute('src');
        }
        scanning = false;
    }

    $: target_address = operation === "SPEND" ? null : contract_address;
    $: contract_address = coin_name == "TOKEN" ? "0xcontractaddress" : "";
    $: op_operation = operation === "SPEND" ? 0 : 1;
    $: qrData = JSON.stringify({
        operation: op_operation,
        amount: amount,
        target: user_address
    });

    const TOKEN_contract = new $BASE.eth.Contract($TOKENABI, $TOKENContractAddress);

    const fetchMerchantStatus = async () => {
        if (merchantInfo){
            return;
        }
        try {
            if (!user_address || !/^0x[a-fA-F0-9]{40}$/.test(user_address)) {
                throw new Error("Invalid user address");
            }
            // const isWhitelisted = await TOKEN_contract.methods.isMerchant(user_address).call();
            // merchant.set(Boolean(isWhitelisted));

            if ($merchant) {
                const rawMerchantInfo = await TOKEN_contract.methods.merchantInfoMap(user_address).call();
                const printQuota = Number(rawMerchantInfo.printQuota) / 1e18;
                const totalCash = Number(rawMerchantInfo.totalCashReceived) / 1e18;
                const totalRecycled = Number(rawMerchantInfo.totalPRecycled) / 1e18;
                const isImbalanced = printQuota + totalRecycled - totalCash;
                merchantInfo = {
                    printQuota: printQuota,
                    totalCashReceived: totalCash,
                    totalTOKENRecycled: totalRecycled,
                    name: rawMerchantInfo.merchantName,
                    merchantAddress: user_address,
                    isFrozen: rawMerchantInfo.isFreeze,
                    isImbalanced: isImbalanced,
                    credit: printQuota + totalRecycled - totalCash
                };
            } else {
                merchantInfo = null;
            }
            return $merchant;
        } catch (error) {
            // merchant.set(false);
            // merchantInfo = null;
            return false;
        }
    };

    const fetchTOKENStats = async () => {
        try {
            const [supply, minted, burnt] = await Promise.all([
                TOKEN_contract.methods.totalSupply().call(),
                TOKEN_contract.methods.totalMinted().call(),
                TOKEN_contract.methods.totalBurnt().call(),
            ]);
            TOKENSupply.set(Number(supply) / 1e18);
            TOKENMinted.set(Number(minted) / 1e18);
            TOKENBurnt.set(Number(burnt) / 1e18);
        } catch (error) {
        }
    };

    async function action() {
        qrSvg ? resetQRCode() : generateQRCode();
    }

    function toggleMerchants() {
        if (showMerchants) {
            showMerchants = false;
        } else {
            showMerchants = true;
        }
    }

    function toggleCamera() {
        if (scanning) {
            stopCamera();
            stopChecking();
        } else if (!scanning && merchantInfo.isFrozen === false) {
            amount = 0;
            target_address = "";
            startCamera();
        }
    }

    function isIOSStandalone() {
        return (
            navigator.standalone &&
            /iPad|iPhone|iPod/.test(navigator.userAgent) &&
            !window.MSStream
        );
    }

    async function startCamera() {
        if (isIOSStandalone()) {
            const hasCameraAccess = await detectIOSCameraTOKEN();
            if (!hasCameraAccess) {
                return;
            }
        }
        try {
            scanning = true;
            videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            videoElement.srcObject = videoStream;
            videoElement.play();
            decodeQRCodeLoop();
        } catch (err) {
            scanning = false;
        }
    }

    $: generateQRCode();

    function generateQRCode() {
        if ((operation === "DEPOSIT" || operation === "SPEND") && user_address && amount > 0) {
            const qr = new QRCode({
                content: qrData,
                width: 372,
                height: 372,
                color: "#FFFFFF",
                background: "transparent",
                join: true,
            });
            qrSvg = qr.svg();
            return;
        }
    }

    function resetQRCode() {
        stopChecking();
        qrSvg = null;
        amount = 0;
    }

    function setAmount(percentage) {
        amount = round(($User_TOKEN * percentage) / 100, 2);
    }

    function round(value, decimals) {
        return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
    }

    function formatVolume(value, float) {
        if (!value || isNaN(value) || value == null || value == 0) {
            return 0;
        } else if (value >= 1000000000000000000000) {
            return `${(value / 1000000000000000000000).toFixed(float)} Z`;
        } else if (value >= 1000000000000000000) {
            return `${(value / 1000000000000000000).toFixed(float)} E`;
        } else if (value >= 1000000000000000) {
            return `${(value / 1000000000000000).toFixed(float)} P`;
        } else if (value >= 1000000000000) {
            return `${(value / 1000000000000).toFixed(float)} T`;
        } else if (value >= 1000000000) {
            return `${(value / 1000000000).toFixed(float)} B`;
        } else if (value >= 1000000) {
            return `${(value / 1000000000).toFixed(float)} M`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(float)} K`;
        } else if (value) {
            return round(value, float);
        }
    }

    function hardReset() {
        operation = "INFO";
        amount = 0;
        qrSvg = null;
        lastTxHash = null;
        Hash = null;
        insufficientBalance = false;
    }

    async function fetchInitialData() {

            const depositImg = new Image();
            depositImg.src = DEPOSIT;
            const spendImg = new Image();
            spendImg.src = SPEND;

            if (!$TOKENMinted || !$TOKENBurnt){
                try {
                    await Promise.all([
                        await fetchTOKENStats(),
                        new Promise(resolve => depositImg.onload = resolve),
                        new Promise(resolve => spendImg.onload = resolve)
                    ]).then(() => {
                        isLoading = false;
                    });             
                } catch (error) {
                    stopCamera();
                    stopChecking();
                }
            } else if ($merchant) {
                await fetchMerchantStatus();
            }
    
    }

    const fetchMerchantOrNot = async () => {
        try {
            if (!user_address || !/^0x[a-fA-F0-9]{40}$/.test(user_address)) {
                throw new Error("Invalid user address");
            }
            const isWhitelisted = await TOKEN_contract.methods.isMerchant(user_address).call();
            merchant.set(Boolean(isWhitelisted));
            return $merchant;
        } catch (error) {
            merchant.set(false);
            return false;
        }
    };

    const checkTokenStatus = () => {
        if (!$TOKENMinted || !$TOKENBurnt) {
            new Promise((resolve) => {
                setTimeout(() => resolve(fetchTOKENStats()), 500);
            });
        } else {
            return;
        }
    };

    onMount(async () => {

        await fetchInitialData();
        
        if (!$merchant){
            await fetchMerchantOrNot();
        } else {
            await Promise.all([
                fetchMerchantStatus()
            ]);
        }
        
        if (!merchantInfo) {

            setInterval(checkTokenStatus, 500);
            
            new Promise((resolve) => {
                setTimeout(() => resolve(getRecentDeposits()), 2000);
            });
            new Promise((resolve) => {
                setTimeout(() => resolve(getRecentSpends()), 3000);
            });
        } 
        
        new Promise((resolve) => {
            setTimeout(() => resolve(fetchMerchantStatus()), 1000);
        });
   

    });

    onDestroy(() => {
        videoElement = null;
        hardReset();
        if (typeof window.gc === 'function') {
            window.gc();
        }
        stopCamera();
    });
</script>





<div style="position:fixed; top:0px; left:0; z-index: 999; 
    height:100vh; width:100vw; background: #000000; ">

    <!-- 頂層部分 -->
    <button
      on:click={stopCamera}
      on:keydown={e => e.key === 'Enter' && stopCamera()}
      style="
        position: fixed;
        background: transparent;
        border: none;
        padding: 0;
        top: 14px;
        right: calc(10vw + 0px);
        z-index: 29;
        cursor: pointer;
      "
      aria-label="Close camera"
    >
      <img
        src={TOKEN_logo}
        alt=""
        role="presentation"
        style="
          width: 28px;
          height: 28px;
          border-radius: 56px;
          pointer-events: none;
        "
      />
    </button>

        <button
          on:click={stopCamera}
          on:keydown={e => e.key === 'Enter' && stopCamera()}
          style="
            position: fixed;
            background: transparent;
            border: none;
            padding: 0;
            top: 12px;
            height:32px; width:24px;
            left: calc(10vw + 0px);
            z-index: 29;
            cursor: pointer;
          "
          aria-label="Close camera"
        >
        <BackButton/>
    </button>



    
{#if lastTxHash}
    
          <video
            autoplay 
            loop 
            muted 
            playsinline in:blur={{ duration: 150 }} 
            style="
                position: fixed; 
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                min-width: 100vw; 
                min-height: 100vh; 
                object-fit: cover;
                border-left: 0px solid;
                border-right: 0px solid;
                border-radius: 16px; 
                z-index: 1100;">
            <source src={TxBg} transition:blur={{ duration: 150 }}   type="video/mp4" />
          </video>
        
            {#if lastTxHash }

                <button on:click={()=>{lastTxHash = "";}}
                  style="
                    position: fixed;
                    background: transparent;
                    border: none;
                    padding: 0;
                    top: 12px;
                    height:32px; width:24px;
                    left: calc(10vw + 0px);
                    z-index: 29;
                    cursor: pointer;
                  "
                >
                  <BackButton/>
                </button>
            
                <!-- 🎉 文字內容，放在影片上方，置中顯示 -->
                <div in:fade={{ duration: 150 }}  style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                width:90vw;
                z-index: 1200;
                ">

                    <div style="position: absolute; width:90vw; left:0; margin-top:-32px;"> <Load {fill}/> </div>
                    
                    <!-- 🎉 成功訊息 -->
                    <p
                        in:fade={{ duration: 150 }}
                        href="https://basescan.org/tx/{Hash}"
                        target="_blank"
                        class="tx-hash-link"
                        style="white-space: pre; position: absolute; width:90vw; left:0; margin-top:0px; font-size: 16px; font-weight: bold; color: {fill}; filter: drop-shadow(0 0 4px {fill}11);"
                    >
                          {#each lastTxHash.split('') as char, i}
                            <span class="gold-text" style="font-size: 16px; font-weight: bold; color: {fill};filter: drop-shadow(0 0 4px {fill}11);" in:fade={{ delay: i * 50, duration: 0 }}>
                                {#if char === ' '}&nbsp;{:else}{char}{/if}</span>
                          {/each}
                    </p>

                        <a
                          href="https://basescan.org/tx/{Hash}"
                          target="_blank"
                          rel="noopener noreferrer"
                          style="white-space: pre; position: absolute; width:90vw; left:0; margin-top:36px; color: {fill}; font-size: 14px; text-decoration: underline;"
                        >
                            <span style="font-size: 12px; font-weight: bold; color: #888888;filter: drop-shadow(0 0 4px {fill}11);">
                                View on BaseScan</span>
                        </a>
                </div>
              
            {:else if lastTxHash === "🤡" }
                    <button on:click={()=>{lastTxHash = "";}}
                      style="
                        position: fixed;
                        background: transparent;
                        border: none;
                        padding: 0;
                        top: 12px;
                        height:32px; width:24px;
                        left: calc(10vw + 0px);
                        z-index: 29;
                        cursor: pointer;
                      "
                    >
                      <BackButton/>
                    </button>
                
                  <!-- 第二個條件塊：為 <p> 添加打字機效果 -->
                  <div in:blur={{ duration: 150 }} style="
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    z-index: 1200;
                  ">
                    <p class="gold-text" style="font-size: 20px; font-weight: bold; color: #FFD700;">
                      {#each (`Available ${coin_name} : ${formatVolume($User_TOKEN, 2)}`).split('') as char, i}
                        <span style="font-size: 16px; font-weight: bold; color: {linkColor};filter: drop-shadow(0 0 8px {linkColor}11);" in:fade={{ delay: i * 50, duration: 0 }}>{char}</span>
                      {/each}
                    </p>
                  </div>
            
            {/if}
    

    
{:else if $merchant}
    
        <div in:blur={{ duration: 150 }}  
            style="position:fixed; width:90vw; min-width:240px;
            border-top: 1.5px solid #444444;background:transparent;
            top:60px; bottom:24px; left:5vw; height:auto; margin:auto; border-radius: 28px; 
            overflow-y: auto;cursor:pointer; z-index:1000; display:flex; flex-direction: column; align-items: center; justify-content: center;"
        >
    
            {#if scanning && merchantInfo.isFrozen === false}
    
                  <p transition:fade={{ duration: 150 }} style="position:absolute; top:80px; width:90vw; font-size:14px; color:white; filter: drop-shadow(0 0 4px {op_color}11); z-index:3000;"> {$lang === "ZH" ? "隨意點擊屏幕以關閉掃描" : "Tap anywhere to close the scanner"} </p>
                
                        <input 
                            type="file"
                            accept="image/*"
                            id="qr-upload"
                            style="display: none;"
                            on:change={handleFileUpload}
                        />
                        <button on:click={() => document.getElementById('qr-upload').click()}  transition:fade={{ duration: 150 }} class="main_button_tx pushable button-11 gold-border"
                                   style=" background:linear-gradient(#8CFFFB44, #ccacf844);  position: fixed; bottom:48px;
                                    font-weight: 700; cursor: pointer; z-index:3000;">
                                  <div class="button-11__content" transition:fade={{ duration: 150 }}  style="filter: drop-shadow(0 0 2px #FFFFFF);">
                                        <video 
                                          autoplay 
                                          loop 
                                          muted 
                                          playsinline 
                                          style="
                                            position: absolute; 
                                            width: 100%; 
                                            max-height: 100%; 
                                            object-fit: cover;
                                            border-radius: 8px; 
                                          margin-top:-2px;
                                            opacity:1;
                                            z-index:-1;">
                                          <source src={ID} type="video/mp4" />
                                        </video>
                                            <p style="position:absolute;white-space: nowrap;top:4px; width:100%;font-size: 16px; font-weight: 600;">
                                                {$lang === "ZH" ? "上載二維碼截圖" : "Upload QR Code"}</p>
                                  </div>
                        </button>
                        <div on:click={toggleCamera} style="background:linear-gradient(transparent, #000000); position: absolute; bottom:0; width: 100%; height: 100%; object-fit: cover; border-radius: 28px; opacity:1; margin-top:-32px;border-radius: 28px; z-index:2; ">
                        </div>
                        <button 
                            style="margin-top: 16px; padding: 8px 16px; background:transparent; z-index:1;
                            color: white; border: none; cursor: pointer;">
                              <video in:blur={{ duration: 150 }} 
                                bind:this={videoElement}
                                autoplay 
                                playsinline 
                                style="position: absolute; width: 100%; height: 100%; object-fit: cover; border-radius: 28px; opacity:1; margin-top:-12px;border-radius: 28px; ">
                              </video>
                        </button>
                        
            {:else}
                
                <div in:fade={{ duration: 150 }}  class="scroll-container" style="position:absolute; top:8px;background:black; padding:8px; border-radius:16px;">
                    <h3 in:fade={{ duration: 600 }} class="gold-text" style="padding: 6px; color: white; text-align: center; font-size: 16px;margin-left:16px;">
                        {$lang === "ZH" ? "商戶檔案數據" : "Merchant Profile"}
                    </h3>
    
                    <table in:fade={{ duration: 800 }} style="width: 80vw; margin: auto; border-collapse: collapse; background:black;">
                        <tbody in:slide={{ duration: 800 }}>

                            <tr in:fade={{ duration: 200 }}>
                                <td style="font-size: 12px; padding: 6px; text-align: left; width:55%;">▫️ {$lang === "ZH" ? "鏈上燃料尚餘" : "Gas Remaining"}</td>
                                <td style="font-size: 12px; padding: 6px; text-align: right; font-weight: bold;">
                                    ⛽ {$UserETH} ETH
                                </td>
                            </tr>
                            <tr in:fade={{ duration: 200 }}>
                                <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;">▫️ {coin_name} {$lang === "ZH" ? "價位" : "Price"}</td>
                                <td style="font-size: 12px; padding: 6px; text-align: right; font-weight: bold;">
                                    $ 0.1282 {"USDC"}
                                </td>
                            </tr>
    
                            {#if merchantInfo}
                                <tr in:fade={{ duration: 400 }}>
                                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;">▫️ {$lang === "ZH" ? "商戶名稱" : "Merchant Name"}</td>
                                    <td style="font-size: 12px; padding: 6px; text-align: right; font-weight: bold;">
                                        {merchantInfo?.name || "N/A"}
                                    </td>
                                </tr>
                                <tr in:fade={{ duration: 500 }}>
                                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;">▫️ {$lang === "ZH" ? "尚餘增值額度" : "Merchant Credit"}</td>
                                    <td style="font-size: 12px; padding: 6px; text-align: right; font-weight: bold;">
                                        {formatVolume(merchantInfo?.credit || 0, 2)} {coin_name}
                                    </td>
                                </tr>
                                <tr in:fade={{ duration: 600 }}>
                                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;">▫️ {$lang === "ZH" ? "增值換得現金" : "Cash Received"}</td>
                                    <td style="font-size: 12px; padding: 6px; text-align: right; font-weight: bold;">
                                        {formatVolume(merchantInfo?.totalCashReceived || 0, 2)} HKD
                                    </td>
                                </tr>
                                <!-- <tr in:fade={{ duration: 700 }}>
                                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;">▫️ {$lang === "ZH" ? coin_name + " 收支狀態" : "Balance Status"}</td>
                                    <td style="font-size: 12px; padding: 6px; text-align: right; font-weight: bold; color: {merchantInfo?.isImbalanced <= 0 ? '#ff4444' : '#44ff44'};">
                                        {merchantInfo?.isImbalanced <= 0 ? "⚠️ " + formatVolume(merchantInfo?.isImbalanced, 2) : "✅ " + formatVolume(merchantInfo?.isImbalanced, 2)}
                                    </td>
                                </tr> -->
                                <tr in:fade={{ duration: 700 }}>
                                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;">▫️ {$lang === "ZH" ? "帳戶活躍狀態" : "Merchant Status"}</td>
                                    <td style="font-size: 12px; padding: 6px; text-align: right; font-weight: bold; color: {merchantInfo?.isFrozen ? '#ff4444' : '#44ff44'};">
                                        {merchantInfo?.isFrozen ? "❄️ Frozen" : "🔥 Active"}
                                    </td>
                                </tr>

                            {:else}
                                <tr in:fade={{ duration: 100 }}>
                                    <td colspan="2" style="font-size: 12px; padding: 16px; text-align: center; color: white;">Loading merchant's data ...</td>
                                </tr>
                            {/if}
    
                        </tbody>
                    </table>
                </div>

                <button on:click={toggleCamera} disabled={merchantInfo?.isFrozen} transition:fade={{ duration: 150 }} class="main_button_tx pushable button-11 gold-border"
                           style=" background:linear-gradient(#8CFFFB44, #ccacf844);  position: fixed; bottom:48px;
                            font-weight: 700; cursor: pointer; z-index:3000;">
                          <div class="button-11__content" transition:fade={{ duration: 150 }}  style="filter: drop-shadow(0 0 2px #FFFFFF);">
                                <video 
                                  autoplay 
                                  loop 
                                  muted 
                                  playsinline 
                                  style="
                                    position: absolute; 
                                    width: 100%; 
                                    max-height: 100%; 
                                    object-fit: cover;
                                    border-radius: 8px; 
                                    margin-top:-2px;
                                    opacity:1;
                                    z-index:-1;">
                                  <source src={ID} type="video/mp4" />
                                </video>
                                    <p style="position:absolute;white-space: nowrap;top:4px; width:100%;font-size: 16px; font-weight: 600;">
                                        {merchantInfo?.isFrozen ? "Frozen Account" : ($lang === "ZH" ? "掃描交易二維碼" : "Scan QR Code")}</p>
                          </div>
                </button>
                
            {/if}
        </div>

{:else if !merchantInfo}

    
        
        <!-- 最外層的 box -->
        <div in:blur={{ duration: 150 }}  on:click={stopCamera} 
          style="position:fixed; width:90vw; min-width:240px; filter: drop-shadow(0 0 8px {op_color}22); border-top: 1.5px solid #444444;background:linear-gradient(#111111, transparent);
              top:60px; bottom:0; left:5vw; height:auto; margin:auto; border-radius: 28px; overflow-y: auto;cursor:pointer;"
        >
    
            <!-- The function box -->
            <div 
              in:fade={{ duration: 150 }} 
              style="
                z-index: 300; 
                position: absolute; 
                top: 20px; 
                width: 80vw; 
                margin-left: 5vw; 
                height: 24px; 
                min-width: 200px; 
                display: flex; 
                align-items: center; 
                justify-content: space-between;"
            >
              {#each [
                    { name: "INFO", color: "#CCCCCC" },
                    { name: "DEPOSIT", color: "#8CFFFB" },
                    { name: "SPEND", color: "#ccacf8" }
              ] as btn}
                <button 
                  on:click={() => { 
                      if($User_TOKEN === 0){
                          
                      }
                      qrSvg = null;
                      operation = btn.name; 
                      op_color = btn.color; 
                      selectedIndex = 0;
                      amount = 0; 
                      showMerchants = false;
                      stopCamera();
                      stopChecking();
                      if (btn.name === "SPEND") target_address = null; 
                  }}
                  class="nav-button"
                  in:fade={{ duration: 150 }}
                  out:scale={{ duration: 150, start: 0.9, opacity: 0 }}
                  style="
                        flex: 1; /* 每個按鈕平分空間 */
                        width: 16vw; /* 確保每個按鈕不會太寬 */
                        color: {operation == btn.name ? '#000000' : btn.color};
                        font-weight: 800;
                        font-size: 12px;
                        margin-top: 0px;
                        height: 32px; 
                        border-radius: 16px;
                        border: none;
                        border-bottom: 2px solid #00000088;
                          background: {operation == btn.name 
                              ? `radial-gradient(circle, white 0%, ${op_color} 100%)` 
                              : 'transparent'};
                        opacity: {operation == btn.name ? '1' : '0.33'};
                        in: background 0.3s ease-in-out, color 0.3s ease-in-out, opacity 0.3s ease-in-out;
                        white-space: nowrap;  
                        overflow: hidden; 
                        text-overflow: ellipsis; 
                  "
                >
                  <span style="margin-top:6px;color: {operation == btn.name ? '#000000' : btn.color};
                               font-weight: 700;
                               font-size: 14px;">
                            {btn.name === "INFO" 
                                ? ($lang === "ZH" ? "資訊" : "INFO")
                                : btn.name === "DEPOSIT"
                                ? ($lang === "ZH" ? "儲值" : "DEPOSIT")
                                : btn.name === "SPEND"
                                ? ($lang === "ZH" ? "消費" : "SPEND")
                                :""}
                            
                            </span>
                </button>
              {/each}
            </div>

            
    
            {#if operation !== "INFO"}
                            
                    <div transition:blur={{ duration: 150 }}  style="in: background 0.3s ease-in-out, color 0.3s ease-in-out, border 0.6s ease-in-out; 
                    position:absolute; background:linear-gradient( {op_color}22, transparent,transparent); top:60px; height:88px; max-height:240px; width:80vw; min-width:240px; margin-left:5vw; border-radius:  16px;">
                                
                                  <video 
                                    autoplay 
                                    loop 
                                    muted 
                                    playsinline 
                                    style="
                                        opacity: 0.8;
                                        position: absolute; 
                                        width: 100%; 
                                        height: 100%; 
                                        object-fit: cover;
                                        border: none;
                                        border-bottom: 1px solid {op_color};
                                        border-radius: 16px; 
                                        filter: drop-shadow(0 0 1px {op_color});
                                        z-index:-1;">
                                    <source src={Bg} type="video/mp4" />
                                  </video>
                        
                                        <div style="opacity: {qrSvg || scanning ? 0 : 1}; pointer-events: {qrSvg && operation === "SPEND" ? 'none' : 'auto'};">
                                          <input
                                            type="number"
                                            bind:value={amount}
                                                on:input={(e) => amount = e.target.value.replace(/^0+/, '')}
                                            disabled={qrSvg !== null || scanning}
                                            style="
                                              margin-left:8px;
                                              position: absolute;
                                              left: 50%;
                                              transform: translateX(-50%);
                                              filter: drop-shadow(0 0 4px #00000088);
                                              width: 50vw;
                                              height: 40px;
                                              padding: 0;
                                              color:white;
                                              font-size: 20px;
                                              font-weight: 700;
                                              text-align: center;
                                              line-height: 32px;
                                              margin-top: 8px;
                                              background: none;
                                                z-index:1000;
                                              opacity: {qrSvg ? 0 : 1};
                                            "
                                          />
                                    
                                            {#key operation}
                                              <!-- 右側幣種名稱 -->
                                              <p in:slide|={{ duration: 150, delay: 150 }}
                                                 style="filter: drop-shadow(0 0 4px #00000088);
                                                        position:absolute; 
                                                        right:5vw;
                                                        top:16px;
                                                        font-size: 14px;
                                                        font-weight:700;
                                                        color:white;
                                                        in: color 300ms ease-in-out;">
                                                {operation == "DEPOSIT" ?  ($lang === "EN" ? "HKD" : "港元") : ($lang === "EN" ? "TOKEN" : "通證幣")}
                                              </p>

                                              <!-- 左側操作文字 -->
                                              <p in:slide|={{ duration: 150 }}
                                                 style="filter: drop-shadow(0 0 4px #00000088);
                                                        position:absolute;
                                                        left:5vw;
                                                        top:16px;
                                                        font-size: 14px;
                                                        font-weight:700;
                                                        color:white;
                                                        in: color 300ms ease-in-out;">
                                                {operation == "DEPOSIT" ?  ($lang === "EN" ? "PAY" : "交付") : ($lang === "EN" ? "PAY" : "消費")}
                                              </p>
                                            {/key}
                    
                    
                    
                                            <div style="position:absolute; top:48px; width:80vw; height:40px; 
                                                        display: flex; align-items: center; justify-content: space-between;
                                                        padding: 0 8px;">

                                                
                    
                                                <!-- 百分比按鈕 -->
                                                
                                                <div  style="margin-left:4px; display: flex; gap: 6px; width: 75%;z-index:160; opacity:{!amount && operation === "SPEND" ? 1 : 0};">
                                                    {#each [25, 50, 75, 100] as percent}
                                                        <button
                                                            on:click={() => setAmount(percent)}
                                                            style="
                                                                flex: 1;
                                                                height: 20px;
                                                                background: linear-gradient( #333333, black, black);;
                                                                border:none;
                                                                border-bottom: 1px solid {op_color};
                                                                filter: drop-shadow(0 0 1px {op_color});
                                                                border-radius: 8px;
                                                                color: {op_color};
                                                                font-size: 10px;
                                                                font-weight: 500;
                                                                in: all 0.33s;
                                                            "
                                                        >
                                                            {percent}%
                                                        </button>
                                                    {/each}
                                                </div>
                                                <div class="balance-display" style="--op-color: {op_color}; --opacity: {!amount && operation === 'SPEND' ? 1 : 0};">
                                                    $ {formatVolume($User_TOKEN, 0)} {coin_name}
                                                </div>
                                            </div>
                                        </div>
                        
                            
                                                <p in:slide={{ duration: 150 }} 
                                                   style="filter: drop-shadow(0 0 4px #00000088);
                                                          position:absolute;
                                                          {qrSvg ? 'left:5vw;' : 'right:5vw;'}
                                                          top:{qrSvg ? '34px' : '44px'};
                                                          font-size: {qrSvg ? '24px' : '14px'};
                                                          font-weight:700;
                                                          color:{qrSvg ? 'white' : op_color};
                                                          z-index:120;
                                                          gap:none;
                                                          opacity:{amount || operation === 'DEPOSIT' ? 1 : 0};
                                                          in: all 300ms ease-in-out; /* 新增這行 */">
                                                    {formatVolume(amount,2)} {operation === 'DEPOSIT' ? coin_name : 'HKD'}
                                                </p>
                                
                                                <p in:slide={{ duration: 150 }}
                                                   style="filter: drop-shadow(0 0 4px #00000088);
                                                          position:absolute;
                                                          left:5vw;
                                                          top:{qrSvg ? '10px' : '44px'};
                                                          font-size: {qrSvg ? '16px' : '14px'};
                                                          font-weight:700;
                                                          color:{op_color};
                                                          z-index:120;
                                                          opacity:{amount || operation === 'DEPOSIT' ? 1 : 0};
                                                          in: all 300ms ease-in-out; /* 新增這行 */">
                                                    {operation === 'DEPOSIT' ?  ($lang === "EN" ? "RECEIVING" : "換取") : ($lang === "EN" ? "PAYING" : "支付價值")}
                                                </p>
                        
                                                  <div in:blur={{ duration: 150 }} 
                                                    style="in: background 0.3s ease-in-out, color 0.3s ease-in-out, border 0.6s ease-in-out;
                                                           position:absolute; min-width:240px;
                                                           top:124px; height:auto; width:80vw; margin-left:0vw; border-radius: 16px;">
                                                                {#if qrSvg}
                                                                    
                                                                        <div in:blur={{ duration: 150 }} on:click={handleButtonClick}
                                                                            style="background:transparent; position: absolute; height:360px; width:360px; z-index:120; opacity: {insufficientBalance ? 0.1 : 1};
                                                                                margin:-7px; margin-top:-12px; left:50%; transform: translateX(-50%); display: flex; align-items: center; justify-content: center;">
                                                                            {@html qrSvg}
                                                                        </div>
                                                                            
                                                                {:else if $recentDeposits || $recentSpends}

                                                                    <div transition:slide={{ duration: 150 }}
                                                                        style="
                                                                            z-index: 300; 
                                                                            position: absolute; 
                                                                            top: 0px; 
                                                                            width: 80vw; 
                                                                            margin-left: 0; 
                                                                            height: 24px; 
                                                                            min-width: 200px; 
                                                                            display: flex; 
                                                                            align-items: center; 
                                                                            justify-content: space-between;" 
                                                                    >
                                                                      <!-- 使用 #each 循環渲染按鈕 -->
                                                                      {#each buttons as { component, index, name }}
                                                                                <button transition:blur={{ duration: 150 }}
                                                                                    on:click={() => {selectedIndex = index; amount = 0;
                                                                                                if ( selectedIndex === 1 && !$recentSpends && !$recentDeposits) { getRecentSpends(), getRecentDeposits() }
                                                                                                else { return; }
                                                                                            }}
                                                                                        class="nav-button"
                                                                                        style="opacity: {selectedIndex === index ? 1 : 0.2}; height:60px; margin:3px; 
                                                                                            filter: drop-shadow(0 0 1px {op_color});
                                                                                            border: none; border-bottom: 1px solid {selectedIndex === index ? op_color : "#888888"}; 
                                                                                            border-radius:12px; background:{selectedIndex === index ? "linear-gradient( #000000cc, #000000, #000000)" : "transparent" };"
                                                                                        >
                                                                                        <div transition:blur={{ duration: 150 }} style="margin-top:-10px; position: absolute;">
                                                                                                <svelte:component this={component} fill={selectedIndex === index ? "#ffffff" : op_color}/>
                                                                                        </div>
                                                                                        <p style="position:absolute; font-size: 12px;margin-top:34px; color:{selectedIndex === index ? "#ffffff" : op_color};">{name}</p>
                                                                                </button>
                                                                      {/each}
                                                                    </div>

                                                                            {#if selectedIndex === 0 || amount}
            
                                                                                    <div class="keypad-container"  style="position:absolute; top:80px;">
                                                                                        
                                                                                                  {#each ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] as num}
                                                                                                        <button class="button-11" on:click={() => handleNumClick(num)}
                                                                                                            style="border-color:{op_color}88;margin-bottom:-4px;">
                                                                                                              <div class="button-11__content">
                                                                                                                <span style="margin-left:4px;">{num}</span>
                                                                                                              </div>
                                                                                                        </button>
                                                                                                  {/each}
                                                                                                          <button class="button-11" on:click={handleBackspace} style="margin-bottom:-4px;">
                                                                                                                <div class="button-11__content">
                                                                                                                     <span style="margin-left:4px;">⌫</span>
                                                                                                                </div>
                                                                                                          </button>
                                                                                                    <button disabled={amount === 0 || !amount} class="button-11 gold-border" on:click={handleButtonClick}
                                                                                                        style="width:128px;margin:16px; filter: drop-shadow(0 0 4px {op_color});">
                                                                                                          <div class="button-11__content ">
                                                                                                                <video 
                                                                                                                    autoplay 
                                                                                                                    loop 
                                                                                                                    muted 
                                                                                                                    playsinline 
                                                                                                                    style="
                                                                                                                        position: absolute; 
                                                                                                                        width: 100%; 
                                                                                                                        max-height: 100%; 
                                                                                                                        object-fit: cover;
                                                                                                                        border-radius: 8px; 
                                                                                                                        margin-top:-2px;
                                                                                                                        opacity:0.8;
                                                                                                                        z-index:-1;">
                                                                                                                    <source src={ID} type="video/mp4" />
                                                                                                                </video>
                                                                                                     
                                                                                                                ↵
                                                                                                                <p style="position:absolute;white-space: nowrap;margin-top:4px; width:100%; line-height: 16px;">
                                                                                                                    {$lang === "ZH" ? "允許交易" : "Permit"}<br>{$lang === "ZH" ? "並生成二維碼" : "Transaction"}</p>
                                                                                                          </div>
                                                                                                    </button>
                                                                                        
                                                                                          </div>

                                                                                        <p style="position:absolute; top:290px; font-size: 10px; width:100%; min-width:280px; color:#888888; text-align: left; z-index:1200;">
                                                                                            <span style="font-size: 10px;">
                                                                                                    {$lang === "ZH" 
                                                                                                     ? "致進階 Web3 用家 : " 
                                                                                                     : "To advanced Web3 users : "}
                                                                                            </span>
                                                                                                {$lang === "ZH" 
                                                                                                     ? " '儲值' 及 '消費' 有別於一般區塊鏈轉賬，透過客製化 ERC20 合約邏輯，容許指定的商戶錢包地址對用戶錢包執行發行及銷毁動作，從而免除用戶的鏈上轉賬手續費，而 Permit 並沒有保管任何用戶的資產。" 
                                                                                                     : " 'DEPOSIT' and 'SPEND' are customized contract logic that enables merchants to mint and burn tokens directly within user wallets to eliminate on-chain transfer fees, and Permit does not custody any user assets."}
                                                                                            <span style="font-size: 10px;">
                                                                                                    {$lang === "ZH" 
                                                                                                     ? "請在錢包應用添加代幣地址以使用一般轉賬功能。" 
                                                                                                     : "Please import token address in wallet app for normal transactions."}
                                                                                            </span>
        
                                                                                        </p>
                                                                                
                                                                            {:else if selectedIndex === 1}
                                                                            
                                                                                    <div  in:blur={{ duration: 150 }}  class="scroll-container" style="position:absolute; top:60px;">
                                                                                        <TX_table {user_address} {operation} recentDeposits={$recentDeposits} recentSpends={$recentSpends} {op_color} TOKEN_contract={$TOKENContractAddress}/>
                                                                                    </div>

                                                                            {:else if selectedIndex === 2}
                                                                                    
                                                                                    <div in:blur={{ duration: 150 }} class="image-container" style="margin-left: -4vw;margin-top: 80px;display: flex;
                                                                                        justify-content: center;
                                                                                        align-items: center;">
                                                                                        <div in:blur={{ duration: 150 }} on:click={()=>{flowmap = false;}} class="scroll-container">
                                                                                            <img src="{operation === "DEPOSIT" ? DEPOSIT : SPEND }" 
                                                                                            class="dynamic-image" style="max-height:300px; max-width:300px; width:80vw;"
                                                                                            alt="infoimg"/>
                                                                                        </div>
                                                                                    </div>
                                                                                    
                                                                            {/if}
                                                                        
                                                                 
                                                                {:else if scanning  && merchantInfo.isFrozen === false}
                                                                    
                                                                    <div 
                                                                        in:blur={{ duration: 150 }} 
                                                                            style="in: background 0.3s ease-in-out, color 0.3s ease-in-out, border 0.6s ease-in-out;
                                                                            position:absolute; background:transparent; min-width:240px;
                                                                            top:0px; height:220px; width:80vw; margin-left:0vw; border-radius: 16px;">
                                                                        
                                                                                <video in:blur={{ duration: 150 }} 
                                                                                    bind:this={videoElement}
                                                                                    autoplay 
                                                                                    playsinline 
                                                                                    style="position: absolute; width: 100%; height: 100%; object-fit: cover; border-radius: 16px; opacity:0.68; margin-top:-16px;">
                                                                                </video>
                                                                        
                                                                    </div>
                                                                
                                                                {/if}
                                                  </div>
                        
                                
                                </div>
                        
                                <p in:blur={{ duration: 150 }}
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   style="
                                     text-decoration: {target_address === contract_address && operation !== "DEPOSIT" ? "underline" : "none"}; 
                                     position:absolute; 
                                     left:50%; 
                                     width:80vw; 
                                     top: {!qrSvg? "234px" : "154px"}; 
                                     transform: translateX(-50%); 
                                     font-size: 12px; opacity:0.666666;
                                     color: {insufficientBalance ? '#ff4444' : op_color};
                                     in: color 0.3s ease-in-out;
                                   ">
                                   {#if insufficientBalance && selectedIndex === 0}
                                       Insufficient {coin_name} balance
                                   {:else if selectedIndex === 0}
                                       {qrSvg ? ($lang === "ZH" ? "請出示此二維碼予商家完成交易" : "Show QR code to merchant") : ($lang === "ZH" ? "請輸入金額並生成交易二維碼" : "Input amount to generate QR code")}
                                   {/if}
                                </p>

                                <p in:blur={{ duration: 150 }} 
                                   style="
                                     text-decoration: {target_address === contract_address && operation !== "DEPOSIT" ? "underline" : "none"}; 
                                     position:absolute; 
                                     left:50%; 
                                     width:80vw; 
                                     top:520px; 
                                     transform: translateX(-50%); 
                                     font-size: 12px; opacity:{qrSvg ? 0.666666 : 1};
                                     color: {insufficientBalance ? '#ff4444' : op_color};
                                     in: color 0.3s ease-in-out;
                                   ">
                                   {#if qrSvg}
                                       {$lang === "ZH" ? "點擊以重置二維碼及金額" : "Tap to reset the QR code"}
                                   {/if}
                                </p>

                {:else}

                        {#if showMerchants}
                            
                                <div transition:blur={{ duration: 150 }} >                
                                    <Merchants /> 
                                    <!-- 呢度係 Permit 商戶列表 -->
                                </div>
                            
                        {:else}
                            
                                <div transition:blur={{ duration: 150 }} >                
                                    <INFO_table {coin_name} />
                                </div>

                                <img on:click={openUniswapTab} src={US} alt="US"  style="position: absolute; height:22px; bottom:186px;left:calc(45vw - 60px);filter: drop-shadow(0 0 4px #eb7af8);"/>
                                <p on:click={openUniswapTab} style="position: absolute; font-size:12px; height:40px; bottom:160px;left:calc(45vw - 32px);filter: drop-shadow(0 0 4px #eb7af8);"> on Uniswap V4</p>



                                <button on:click={openUniswapTab} transition:fade={{ duration: 150 }} class="main_button_tx pushable button-11 gold-border"
                                           style=" background:linear-gradient(#8CFFFB44, #ccacf844);  position: absolute; bottom:120px;
                                            font-weight: 700; cursor: pointer; z-index:3000;">
                                          <div class="button-11__content" transition:fade={{ duration: 150 }}  style="filter: drop-shadow(0 0 2px #eb7af8);border:1px solid #eb7af8;">
                                                <video 
                                                  autoplay 
                                                  loop 
                                                  muted 
                                                  playsinline 
                                                  style="
                                                    position: absolute; 
                                                    width: 100%; 
                                                    max-height: 100%; 
                                                    object-fit: cover;
                                                    border-radius: 8px; 
                                                    margin-top:-2px;
                                                    opacity:1;
                                                    z-index:-1;">
                                                  <source src={ID} type="video/mp4" />
                                                </video>
                                                    <p style="position:absolute;white-space: nowrap;top:4px; width:100%;font-size: 16px; font-weight: 600; ">
                                                        USDC ＜一＞ {coin_name}</p>
                                          </div>
                                </button>


                        {/if}

                    <button on:click={toggleMerchants} transition:fade={{ duration: 150 }} class="main_button_tx pushable button-11 gold-border"
                               style=" background:linear-gradient(#8CFFFB44, #ccacf844);  position: absolute; bottom:48px;
                                font-weight: 700; cursor: pointer; z-index:3000;">
                              <div class="button-11__content" transition:fade={{ duration: 150 }}  style="filter: drop-shadow(0 0 2px #FFFFFF);">
                                    <video 
                                      autoplay 
                                      loop 
                                      muted 
                                      playsinline 
                                      style="
                                        position: absolute; 
                                        width: 100%; 
                                        max-height: 100%; 
                                        object-fit: cover;
                                        border-radius: 8px; 
                                        margin-top:-2px;
                                        opacity:1;
                                        z-index:-1;">
                                      <source src={ID} type="video/mp4" />
                                    </video>
                                        <p style="position:absolute;white-space: nowrap;top:4px; width:100%;font-size: 16px; font-weight: 600;">
                                            {showMerchants ? "TOKEN Status" : "HKD ＜一＞ " + coin_name}</p>
                              </div>
                    </button>

                {/if}
                
        </div>

{/if}

</div>

<style>

    @keyframes colorChangeInline {
        0%, 100% {
            color: inherit; /* 直接使用繼承的 {op_color} */
        }
        50% {
            color: white; /* 中間過渡到白色 */
        }
    }
    /* 基础样式 */
    .nav-button {
            height: 40px;
            width: 22vw;
            min-width: 40px;
            font-size: 12px;
            font-weight: 700;
            border: 3px solid var(--button-color);
            color: var(--button-color);
            background-color: transparent;
            cursor: pointer;
            opacity: 0.33; /* 默认其他按钮透明度 */
            z-index: 1006;
    }
    /* Keyframes for moving animation */
    @keyframes moveSlant {
        from {
            background-position: 0 0;
        }
        to {
            background-position: 100% 0;
        }
    }
    
    @keyframes fadeInOut {
        0%, 100% {
            opacity: 0;
        }
        50% {
            opacity: 1;
        }
    }

    .tx-hash-link {
        in: color 0.3s ease-in-out;
    }

    .balance-display {
        position: absolute;
        right: 8vw;
        color: var(--op-color);
        margin-top:-4px;
        font-size: 10px; /* 預設字體大小 */
        font-weight: 700;
        text-align: left;
        width: 10vw;
        opacity: var(--opacity);
    }

    /* 當視窗寬度大於600px時，字體大小變為16px */
    @media (min-width: 801px) {
        .balance-display {
            font-size: 12px;
        }
    }
  </style>