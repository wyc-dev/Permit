<script>
    import { onMount , onDestroy } from "svelte";
    import { ethers } from "ethers";
    import { fade, scale, slide , blur  } from "svelte/transition";
    import TOKEN_logo from "../tokens/TOKEN.png";
    import DEPOSIT from "../tokens/1.png";
    import SPEND from "../tokens/2.png";
    import { refer_address, BASE, SCAN, lang,
          TOKENContractAddress, TOKENABI} from '../../../../store.js';
    import QrcodeDecoder from "qrcode-decoder";
    import INFO_table from "./tool_parts/token_info_table.svelte";
    import TX_table from "./tool_parts/tx_record.svelte";
    import Merchants from "./tool_parts/merchant_list.svelte";
    import BackButton from "./tool_parts/BackButton.svelte";
    import Load from "./tool_parts/loading/loading.svelte";
    export let coin_name;
    export let coinbase;
    export let eth_price;
    export let user_balance;
    export let lp_balance;
    export let user_address;
    let insufficientBalance = false;
    let errorTimeout = null;
    let lastTxHash = null;
    let Hash;
    let recentDeposits;
    let isLoading = true;
    let recentSpends;
    let merchantInfo;
    let showMerchants = false;
    let totalSupply = 0;
    let totalMinted = 0;
    let totalBurnt = 0;
    let merchant;
    let operation = "INFO";
    let op_color = "#CCCCCC";
    $: linkColor = op_color;
    $: description2 =
        coin_name === "TOKEN"
            ? ($lang === "ZH" ? "* 這裡的總流通量已扣除去中心化 LP 中的代幣數量 ": "* Circulatiing Supply here already minus the number of tokens in the decentralized LP.")
            : "";
    let amount = 0; // 输入框绑定的值，初始为 0
    import QRCode from "qrcode-svg";
    import Bg from "../assets/ton_invest_power_bg.mp4";
    import TxBg from "../assets/tx.mp4";
    import ID from "../assets/DID.mp4";
    import Keyboard from "../assets/keyboard.svelte";
    import Guide from "../assets/guide.svelte";
    import Blocks from "../assets/blocks.svelte";
    import US from "../assets/US.png";
    // 定義按鈕數據數組
  let buttons = [
    { component: Keyboard, index: 0, name: ($lang === "ZH" ? "轉賬操作" : "Transfer") },
    { component: Blocks, index: 1, name: ($lang === "ZH" ? "歷史紀錄" : "History") },
    { component: Guide, index: 2, name: ($lang === "ZH" ? "流程說明" : "Guide") }
  ];
  // 跟踪當前選中的按鈕，默認選中第一個
  let selectedIndex = 0;
    let checkTxAttempts = 0;
    let checkTxInterval = setInterval(checkBlockchainForTx, 600);
    let scanning = false;
    let videoStream = null;
    let videoElement = null;
    let qrSvg = null;
    let qrDecoder = new QrcodeDecoder();
    import jsQR from "jsqr"; // 正確的 QR Code 解析庫


    // 在decodeQRCodeLoop中添加性能检查
    const MAX_SCAN_TIME = 30 * 1000; // 30秒超时
    let scanStartTime = 0;

      // 通用震动模式配置（单位：毫秒）
      const vibrationPatterns = {
        success: [100, 30, 100],   // 短-短-短
        process: [200],            // 长震动
        error: [500, 100, 200]     // 超长-短-中
      }

      // 處理按鈕點擊
      function handleNumClick(value) {
          if(value === "0" && (amount === 0 || amount === "0")){
                return;
          } else if(amount === 0 || amount === "0"){
                amount = value;
                return;
          }
        amount += value;
      }

      // 處理退格
      function handleBackspace() {
            amount = amount.slice(0, -1);
      }

    // 新增常量定义
    const BLACK_HOLE_ADDRESS = "0x0000000000000000000000000000000000000000";

    function openUniswapTab() {
        window.open(`https://app.uniswap.org/swap?inputCurrency=0x833589fcd6edb6e08f4c7c32d4f71b54bda02913&outputCurrency=${$TOKENContractAddress}&chain=base`, '_blank');
    }

    // 增强版交易记录获取
    async function fetchTokenTransactions(type) {
        try {
            const url = new URL("https://api.basescan.org/api");
            url.search = new URLSearchParams({
                module: "account",
                action: "tokentx",
                contractaddress: $TOKENContractAddress,
                address: user_address,
                page: 1,
                offset: 100,  // 获取最近10笔确保有足够数据
                sort: "desc", // 按时间倒序
                apikey: $SCAN
            });

            const response = await fetch(url);
            const data = await response.json();

            // console.log(data);

            // if (data.status !== "1") throw new Error(data.message || "API请求失败");

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
                .slice(0, 5) // 取前5笔
                .map(tx => formatTransaction(tx, type));

        } catch (error) {
            // console.error(`获取${type}记录失败:`, error);
            return [];
        }
    }

    // 统一交易格式处理
    function formatTransaction(tx, type) {
        const isDeposit = type === "DEPOSIT";
        return {
            type: type,
            amount: ethers.formatUnits(tx.value, 18),
            timestamp: new Date(parseInt(tx.timeStamp) * 1000).toLocaleString(),
            txHash: tx.hash,
            counterparty: isDeposit ? tx.to : tx.from, // 显示实际交互地址
            direction: isDeposit ? "←" : "→",
            gasUsed: `${ethers.formatUnits(tx.gasUsed, 9)} Gwei`,
            status: parseInt(tx.confirmations) > 12 ? "Confirmed" : "Pending"
        };
    }

    // 修改后的获取函数
    async function getRecentDeposits() {
        recentDeposits = await fetchTokenTransactions("DEPOSIT");
        // console.log(recentDeposits);
    }

    async function getRecentSpends() {
        recentSpends = await fetchTokenTransactions("SPEND");
        // console.log(recentSpends);
    }

      // 设备震动函数
      const triggerVibration = (type = 'process') => {
        if ("vibrate" in navigator) {
          navigator.vibrate(vibrationPatterns[type])
        }
      }
    
    // 檢查區塊鏈事件並更新餘額
    async function updateBalance() {
        try {

            // 從 API 獲取用戶餘額
            const [response] = await Promise.all([
                fetch(`https://api.basescan.org/api?module=account&action=tokenbalance&contractaddress=${$TOKENContractAddress}&address=${user_address}&tag=latest&apikey=5IHYR92H2XEWMV44WI1HNIY9YSHFM4SA2B`),
            ]);
            const data = await response.json();
            if (data.status !== "1") {
                // console.log(data);
                // console.error("獲取餘額失敗:", data.message);
                return false;
            }
            // 解析 API 回傳的餘額 (去除 18 位小數)
            const apiBalance = parseFloat(ethers.formatUnits(data.result, 18));
            // 計算餘額差額
            const balanceDiff = Math.abs(apiBalance - user_balance);
            // console.log("API 餘額:", apiBalance);
            // console.log("餘額變動:", balanceDiff);
            let merchant; // 預設為 "Unknown Merchant"
            // 透過 `merchants` mapping 取得 `merchant.name`
            try {
                merchant = await $TOKENContractAddress.merchants(merchant);
                // console.log(merchant);
            } catch (contractError) {
                // console.warn("查詢商家名稱失敗:", contractError);
            }
            // 如果差額與交易金額相差 0.1 內，則確認交易
            if (Math.abs(balanceDiff - amount) < 0.1 && round(apiBalance,2) !== round(user_balance,2) ) {
                await Promise.all([
                    getRecentDeposits(),
                    getRecentSpends(),
                    fetchTokenTransactions()
                ]);
                triggerVibration('success');
                updateLinkColor("#22FF22");
                lastTxHash = `${operation === "DEPOSIT" ? "Received" : "Paid"} ${formatVolume(amount,2)} ${coin_name}`;
                setTimeout(() => {
                    operation = "INFO";
                    amount = 0;
                    qrSvg = null;
                    lastTxHash = "";
                }, 5000);
                user_balance = apiBalance;
                return true;
            }
        } catch (error) {
            // // console.error("檢查區塊鏈事件失敗:", error);
            stopChecking();
            return false;
        }
    }
    // 啟動檢查的函數
    let checkInterval = null;

    function startChecking() {
        if (checkInterval) clearInterval(checkInterval); // 清除舊的檢查
        checkInterval = setInterval(async () => {
            const found = await updateBalance();
        }, 1500); // 每 1.5 秒檢查一次
    }

    function stopChecking() {
        if (checkInterval) clearInterval(checkInterval); // 停止檢查
        clearInterval(checkInterval); 
    }

    // 修改按鈕點擊邏輯
    function handleButtonClick() {
        if (operation === "SPEND" && amount > user_balance) {
            insufficientBalance = true;
            if (errorTimeout) clearTimeout(errorTimeout);
            errorTimeout = setTimeout(() => {
                qrSvg = null;
                insufficientBalance = false;
                amount = 0;
            }, 600);
        } else {
            action(); // 生成或重置 QR Code
            if (!merchant && qrSvg && amount) {
                startChecking(); // 啟動檢查邏輯
            } else {
                stopChecking();
            }
        }
    }

    // 📷 使用攝像頭掃描 QR Code
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
                    // console.log("QR Code Data:", code.data);
                    const jsonData = JSON.parse(code.data); // 轉換成 JSON
                    await parseScannedData(jsonData);
                    stopCamera();
                    break;
                }
            } catch (err) {
                if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
                    // console.error("Video not ready for QR decoding.");
                    await new Promise(resolve => setTimeout(resolve, 500));
                    continue; // Skip this loop iteration
                }
            }
            await new Promise(resolve => setTimeout(resolve, 200)); // 每 0.2 秒扫描一次
            if (!videoStream){
                stopCamera();
                break;
            }
        }
    }

    // 📂 處理上傳的 QR Code 圖片
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
                    // console.log("QR Code Data:", code.data);
                    const jsonData = JSON.parse(code.data); // 轉換成 JSON
                    await parseScannedData(jsonData);
                } else {
                    // // console.error("No QR code found.");
                }
            };
            image.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    async function parseScannedData(data) {
        try {
            const parsedData = typeof data === "string" ? JSON.parse(data) : data;
            // console.log("解析到的数据:", parsedData);

            // 转换金额为wei单位
            const amountWei = ethers.parseUnits(parsedData.amount.toString(), 18);

            if (parsedData.operation === 0) {
                await SPENDTOKEN(parsedData.target, amountWei);
            } else if (parsedData.operation === 1) {
                await DEPOSITTOKEN(parsedData.target, amountWei);
            }
        } catch (err) {
            lastTxHash = "Transaction canceled ";// + err.message;
        }
    }

    async function DEPOSITTOKEN(target, amount) {
        lastTxHash = `Approving transaction`;
        try {
            // 🔹 創建 provider & signer
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            // 🔹 取得使用者的 EVM 錢包地址
            const TOKEN_tx = new ethers.Contract($TOKENContractAddress, $TOKENABI, signer);
            // 🔹 發送交易
            const tx = await TOKEN_tx.mintToken(target, amount);
            // 階段 1: 提交交易時的顏色 (#FFF988)
            const amountReg = ethers.toQuantity(amount); // 轉為 ethers.Quantity
            lastTxHash = `Minting ${formatVolume(amountReg / 10 ** 18,2)} ${coin_name}`;
            updateLinkColor("#FFD700");
            await tx.wait();
            // 階段 2: 交易確認後的顏色 (#88FF88)
            triggerVibration('process');
            Hash = tx.hash;
            lastTxHash = `Transaction confirmed`;
            updateLinkColor("#22FF22");
            stopCamera();
        } catch (error) {
            // 階段 3: 交易取消時的顏色 (#FFFF88)
            triggerVibration('error');
            lastTxHash = "Transaction canceled";// + error.message;
            updateLinkColor("#FF2222");
            stopCamera();
        } finally {
            triggerVibration('success');
            stopCamera();
            await Promise.all([
                getRecentDeposits(),
                getRecentSpends(),
                fetchContractStats(),
                fetchMerchantStatus()]);
            operation = "INFO";
            op_color = "#CCCCCC";
            setTimeout(() => {
                lastTxHash = "";
                updateLinkColor("#FFD700"); // 重置顏色
            }, 5000);
        }
    }

    async function SPENDTOKEN(target, amount) {
        lastTxHash = `Approving transaction`;
        try {
            // 🔹 創建 provider & signer
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            // 🔹 創建合約實例
            const TOKEN_tx = new ethers.Contract($TOKENContractAddress, $TOKENABI, signer);
            // 🔹 發送交易
            const tx = await TOKEN_tx.payMerchant(target, amount);
            // 階段 1: 提交交易時的顏色 (#FFF988)
            const amountReg = ethers.toQuantity(amount); // 轉為 ethers.Quantity
            lastTxHash = `Receiving ${formatVolume(amountReg / 10 ** 18,2)} ${coin_name}`;
            updateLinkColor("#FFD700");
            await tx.wait();
            // 階段 2: 交易確認後的顏色
            triggerVibration('process');
            Hash = tx.hash;
            lastTxHash = `Transaction confirmed`;
            updateLinkColor("#22FF22");
            stopCamera();
        } catch (error) {
            // 階段 3: 交易取消時的顏色
            triggerVibration('error');
            lastTxHash = "Transaction canceled";
            updateLinkColor("#FF2222");
            stopCamera();
        } finally {
            triggerVibration('success');
            stopCamera();
            await Promise.all([
                getRecentDeposits(),
                getRecentSpends(),
                fetchContractStats(),
                fetchMerchantStatus()]);
            operation = "INFO";
            op_color = "#CCCCCC";
            setTimeout(() => {
                lastTxHash = "";
                updateLinkColor("#FFD700"); // 重置顏色
            }, 5000);
        }
    }

    let fill = "white";

    // 更新 <a> 標籤顏色的函數
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
                track = null; // 显式解除引用
            });
            videoStream = null;
        }
        if (videoElement) {
            videoElement.srcObject = null;
            videoElement.pause();
            videoElement.removeAttribute('src'); // 清除残留视频源
        }
        scanning = false;
    }
    

    
    $: target_address = operation === "SPEND" ? null : contract_address ;
    $: contract_address = coin_name == "TOKEN" 
        ? "0xcontractaddress" : "";
    $: op_operation = operation === "SPEND" ? 0 : 1;
    $: qrData = JSON.stringify({
        operation: op_operation, // 記錄操作類型
        // contract: $TOKENContractAddress,
        amount: amount, // 轉換為 18 位小數
        target: user_address
    });

    // 創建合約實例
    const TOKEN_contract = new $BASE.eth.Contract($TOKENABI, $TOKENContractAddress);
    
    const fetchMerchantStatus = async () => {
        try {
            if (!user_address || !/^0x[a-fA-F0-9]{40}$/.test(user_address)) {
                throw new Error("Invalid user address");
            }
            // 查询是否在商户白名单
            const isWhitelisted = await TOKEN_contract.methods
                .isMerchant(user_address)
                .call();
            merchant = Boolean(isWhitelisted);
            
            if (merchant) {
                const rawMerchantInfo = await TOKEN_contract.methods
                    .merchantInfoMap(user_address)
                    .call();

                // 转换字段为数值类型（考虑BigNumber处理大数）
                const printQuota = Number(rawMerchantInfo.printQuota) / 1e18;
                const totalCash = Number(rawMerchantInfo.totalCashReceived) / 1e18;
                const totalRecycled = Number(rawMerchantInfo.totalPRecycled) / 1e18;

                // 计算收支平衡状态
                const isImbalanced = printQuota + totalRecycled - totalCash;
                merchantInfo = {
                    printQuota: printQuota,               // 铸币配额
                    totalCashReceived: totalCash,         // 接收现金总量
                    totalTOKENRecycled: totalRecycled,    // 回收TOKEN总量
                    name: rawMerchantInfo.merchantName,   // 商户名称
                    merchantAddress: user_address,
                    isFrozen: rawMerchantInfo.isFreeze,
                    isImbalanced: isImbalanced,          // 新增计算字段
                    credit: printQuota + totalRecycled - totalCash
                };

            } else {
                merchantInfo = null;
            }

            return merchant;
        } catch (error) {
            // console.error("商户状态获取失败:", {
            //     error: error.message,
            //     address: user_address,
            //     stack: error.stack
            // });
            merchant = false;
            merchantInfo = null;
            return false;
        }
    };

    const fetchContractStats = async () => {
        try {
            [
                totalSupply,
                totalMinted,
                totalBurnt
            ] = await Promise.all([
                TOKEN_contract.methods.totalSupply().call()
                    .then(val => Number(val) / 1e18),
                TOKEN_contract.methods.totalMinted().call()
                    .then(val => Number(val) / 1e18),
                TOKEN_contract.methods.totalBurnt().call()
                    .then(val => Number(val) / 1e18)
            ]);
        } catch (error) {
            // console.error("🚨 獲取合約數據失敗:", error);
        }
    };



      
    async function action() {
        qrSvg ? resetQRCode() : generateQRCode();      
    }
    
    // 🏆 檢查區塊鏈是否有符合的交易
    async function checkBlockchainForTx() {
    
    
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
        // 🔼 iOS 独立模式特殊处理
        const hasCameraAccess = await detectIOSCameraTOKEN();
        if (!hasCameraAccess) {
          // alert("请在 Safari 中打开此页面并授予相机权限");
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

      // 自動生成 QR Code
      $: generateQRCode();


            // 🎯 生成 QR Code 並啟動交易監測
            function generateQRCode() {
                if ((operation === "DEPOSIT" || operation === "SPEND") && user_address && amount > 0) {
                    const qr = new QRCode({
                    content: qrData,
                    width: 330,
                    height: 330,
                    color: "#FFFFFF",
                    background: "transparent",
                    join: true,
                    });
                    qrSvg = qr.svg();
                    return;
                }
            }
            
            // 重置 QR Code 並將 amount 設為 0
            function resetQRCode() {
                stopChecking();
                qrSvg = null;
                amount = 0;
            }

  

    function identifyBlockchainAddress(address) {
        // EVM 地址檢測 (0x 開頭 + 40 個十六進制字符)
        const evmRegex = /^0x[a-fA-F0-9]{40}$/;
        // TON 地址檢測 (通常是 48 或 66 個字符的 Base64Url 格式)
        const tonRegex = /^(EQ|Ef|UQ|Uf|kQ)[A-Za-z0-9_-]{46,64}$/;
        // Solana 地址檢測 (43-44 字符 Base58)
        const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{43,44}$/;

        if (evmRegex.test(address)) {
            return "EVM";
        } else if (tonRegex.test(address)) {
            return "TON";
        } else if (solanaRegex.test(address)) {
            return "SOL";
        } else {
            return "Invalid";
        }
    }


            
      // 设置 amount 的函数
      function setAmount(percentage) {
                amount = round((user_balance * percentage) / 100, 2);
      }

      function round(value, decimals) {
        return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
      }

      function formatVolume(value, float) {
        if (!value || isNaN(value) || value == null || value == 0 ) {
            return 0;
        } else if (value >= 1000000000000000000000) { // 10²¹
            return `${(value / 1000000000000000000000).toFixed(float)} Z`;
        } else if (value >= 1000000000000000000) {    // 10¹⁸
            return `${(value / 1000000000000000000).toFixed(float)} E`;
        } else if (value >= 1000000000000000) {       // 10¹⁵
            return `${(value / 1000000000000000).toFixed(float)} P`;
        } else if (value >= 1000000000000) {          // 10¹²
            return `${(value / 1000000000000).toFixed(float)} T`;
        } else if (value >= 1000000000) {
            return `${(value / 1000000000).toFixed(float)} B`;
        } else if (value >= 1000000) {
            return `${(value / 1000000).toFixed(float)} M`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(float)} K`;
        } else if (value){
            return round(value, float);
        }
      }


    // 重置所有交易相关状态
    function hardReset() {
        operation = "INFO";
        amount = 0;
        qrSvg = null;
        lastTxHash = null;
        Hash = null;
        checkTxAttempts = 0;
        insufficientBalance = false;
    }


      // 監聽用戶地址變化
      $: {
        if (user_address) {
          fetchMerchantStatus();
        } else {
          merchant = false;
        }
      }

    onMount(async () => {
        
        const depositImg = new Image();
        depositImg.src = DEPOSIT;
        const spendImg = new Image();
        spendImg.src = SPEND;

        try {
            await Promise.all([
                    fetchContractStats(),
                    getRecentDeposits(),
                    getRecentSpends(),
                    new Promise(resolve => depositImg.onload = resolve),
                    new Promise(resolve => spendImg.onload = resolve)
                ]).then(() => {
                    isLoading = false; // 圖片加載完成，隱藏 loading 動畫
                });
            if (merchant) {
                await fetchMerchantStatus();
            }
        } catch (error) {
            stopCamera();
            stopChecking();
        }
        
        window.addEventListener('error', (event) => {
            // console.error("全局错误捕获:", event.error);
            // 可以发送错误日志到服务器
        });
    });

    onDestroy(() => {
        // 显式解除DOM引用
        videoElement = null;
        hardReset();

        // 强制垃圾回收（非标准方法，仅示例）
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
            playsinline in:blur={{ duration: 300 }} 
            style="
                position: absolute; 
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
            <source src={TxBg} in:blur={{ durFation: 300 }}  type="video/mp4" />
          </video>
        
            {#if lastTxHash }
            
                <!-- 🎉 文字內容，放在影片上方，置中顯示 -->
                <div in:fade={{ duration: 300 }}  style="
                position: absolute;
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
                        in:fade={{ duration: 300 }}
                        href="https://basescan.org/tx/{Hash}"
                        target="_blank"
                        class="tx-hash-link"
                        style="white-space: pre; position: absolute; width:90vw; left:0; margin-top:0px; font-size: 16px; font-weight: bold; color: {fill};filter: drop-shadow(0 0 8px {fill}11);"
                    >
                          {#each lastTxHash.split('') as char, i}
                            <span class="gold-text" style="font-size: 16px; font-weight: bold; color: {fill};filter: drop-shadow(0 0 40px {fill});" in:fade={{ delay: i * 50, duration: 0 }}>
                                {#if char === ' '}&nbsp;{:else}{char}{/if}</span>
                          {/each}
                    </p>

                        <a
                          href="https://basescan.org/tx/{Hash}"
                          target="_blank"
                          rel="noopener noreferrer"
                          style="white-space: pre; position: absolute; width:90vw; left:0; margin-top:36px; color: {fill}; font-size: 14px; text-decoration: underline;"
                        >
                            <span style="font-size: 12px; font-weight: bold; color: #888888;filter: drop-shadow(0 0 40px {fill});">
                                View on BaseScan</span>
                        </a>
                </div>
              
            {:else if lastTxHash === "🤡" }
                
                  <!-- 第二個條件塊：為 <p> 添加打字機效果 -->
                  <div in:blur={{ duration: 300 }} style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    z-index: 1200;
                  ">
                    <p class="gold-text" style="font-size: 20px; font-weight: bold; color: #FFD700;">
                      {#each (`Available ${coin_name} : ${formatVolume(user_balance, 2)}`).split('') as char, i}
                        <span style="font-size: 16px; font-weight: bold; color: {linkColor};filter: drop-shadow(0 0 8px {linkColor}11);" in:fade={{ delay: i * 50, duration: 0 }}>{char}</span>
                      {/each}
                    </p>
                  </div>
            
            {/if}
    

    
{:else if merchant}
    
        <div in:blur={{ duration: 300 }}  
            style="position:fixed; width:90vw; min-width:240px;
            border-top: 1.5px solid #444444;background:transparent;
            top:60px; bottom:24px; left:5vw; height:auto; margin:auto; border-radius: 28px; 
            overflow-y: auto;cursor:pointer; z-index:1000; display:flex; flex-direction: column; align-items: center; justify-content: center;"
        >
    
            {#if scanning && merchantInfo.isFrozen === false}
    
                  <p transition:fade={{ duration: 300 }} style="position:absolute; top:80px; width:90vw; font-size:14px; color:white; filter: drop-shadow(0 0 4px {op_color}); z-index:3000;"> {$lang === "ZH" ? "隨意點擊屏幕以關閉掃描" : "Tap anywhere to close the scanner"} </p>
                
                        <input 
                            type="file"
                            accept="image/*"
                            id="qr-upload"
                            style="display: none;"
                            on:change={handleFileUpload}
                        />
                        <button on:click={() => document.getElementById('qr-upload').click()}  transition:fade={{ duration: 300 }} class="main_button_tx pushable button-11 gold-border"
                                   style=" background:linear-gradient(#8CFFFB44, #ccacf844);  position: fixed; bottom:48px;
                                    font-weight: 700; cursor: pointer; z-index:3000;">
                                  <div class="button-11__content" transition:fade={{ duration: 300 }}  style="filter: drop-shadow(0 0 2px #FFFFFF);">
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
                
                <div in:fade={{ duration: 300 }}  class="scroll-container" style="position:absolute; top:8px;background:black; padding:8px; border-radius:16px;">
                    <h3 in:fade={{ duration: 600 }} class="gold-text" style="padding: 6px; color: white; text-align: center; font-size: 16px;margin-left:16px;">
                        {$lang === "ZH" ? "商戶檔案數據" : "Merchant Profile"}
                    </h3>
    
                    <table in:fade={{ duration: 800 }} style="width: 80vw; margin: auto; border-collapse: collapse; background:black;">
                        <tbody in:slide={{ duration: 800 }}>
                            <tr in:fade={{ duration: 200 }}>
                                <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;">▫️ {coin_name} {$lang === "ZH" ? "價位" : "Price"}</td>
                                <td style="font-size: 12px; padding: 6px; text-align: right; font-weight: bold;">
                                    0.128205 {"USDC"}
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
                                        {merchantInfo?.isImbalanced <= 0 ? "⚠️ " + formatVolume(merchantInfo?.isImbalanced) : "✅ " + formatVolume(merchantInfo?.isImbalanced)}
                                    </td>
                                </tr> -->
                                <tr in:fade={{ duration: 700 }}>
                                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;">▫️ {$lang === "ZH" ? "帳戶活躍狀態" : "Merchant Status"}</td>
                                    <td style="font-size: 12px; padding: 6px; text-align: right; font-weight: bold; color: {merchantInfo?.isFrozen ? '#ff4444' : '#44ff44'};">
                                        {merchantInfo?.isFrozen ? "❄️ Frozen" : "🔥 Active"}
                                    </td>
                                </tr>
                                <tr in:fade={{ duration: 800 }}>
                                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;">▫️ {$lang === "ZH" ? "總流通量 " : "Circulating Supply *"}</td>
                                    <td style="font-size: 12px; padding: 6px; text-align: right; font-weight: bold;">
                                        {formatVolume(totalSupply - lp_balance,2)} {coin_name}
                                    </td>
                                </tr>

                                <tr in:fade={{ duration: 800 }}>
                                    <p style="font-size: 10px; padding: 22px; margin-top:-16px; text-align: left; width:180%; color:#888888;">{description2}</p>
                                </tr>

                            {:else}
                                <tr in:fade={{ duration: 100 }}>
                                    <td colspan="2" style="font-size: 12px; padding: 16px; text-align: center; color: white;">Loading merchant's data ...</td>
                                </tr>
                            {/if}
    
                        </tbody>
                    </table>
                </div>

                <button on:click={toggleCamera} disabled={merchantInfo?.isFrozen} transition:fade={{ duration: 300 }} class="main_button_tx pushable button-11 gold-border"
                           style=" background:linear-gradient(#8CFFFB44, #ccacf844);  position: fixed; bottom:48px;
                            font-weight: 700; cursor: pointer; z-index:3000;">
                          <div class="button-11__content" transition:fade={{ duration: 300 }}  style="filter: drop-shadow(0 0 2px #FFFFFF);">
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

{:else if !merchant}

    
        
        <!-- 最外層的 box -->
        <div in:blur={{ duration: 300 }}  on:click={stopCamera} 
          style="position:fixed; width:90vw; min-width:240px; filter: drop-shadow(0 0 8px {op_color}22); border-top: 1.5px solid #444444;background:linear-gradient(#111111, transparent);
              top:60px; bottom:0; left:5vw; height:auto; margin:auto; border-radius: 28px; overflow-y: auto;cursor:pointer;"
        >
    
            <!-- The function box -->
            <div 
              in:fade={{ duration: 300 }} 
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
                  in:fade={{ duration: 300 }}
                  out:scale={{ duration: 300, start: 0.9, opacity: 0 }}
                  style="
                        flex: 1; /* 每個按鈕平分空間 */
                        width: 16vw; /* 確保每個按鈕不會太寬 */
                        color: {operation == btn.name ? '#000000' : btn.color};
                        font-weight: 800;
                        font-size: 12px;
                        margin-top: 0px;
                        height: 32px; 
                        border-radius: 16px;
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
                            
                    <div in:blur={{ duration: 300 }}  style="in: background 0.3s ease-in-out, color 0.3s ease-in-out, border 0.6s ease-in-out;
                    position:absolute; background:transparent; top:56px; height:88px; max-height:240px; width:80vw; min-width:240px; margin-left:5vw; border-radius:  16px;">
                                
                                  <video 
                                    autoplay 
                                    loop 
                                    muted 
                                    playsinline 
                                    style="
                                      position: absolute; 
                                      width: 100%; 
                                      height: 100%; 
                                      object-fit: cover;
                                      border-left: 0px solid ;
                                      border-right:0px solid;
                                      border-top: 2px solid #333333;
                                      border-bottom: 2px solid #111111;
                                      border-radius: 16px; 
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
                                              <p in:slide|={{ duration: 300, delay: 150 }}
                                                 style="filter: drop-shadow(0 0 4px #00000088);
                                                        position:absolute; 
                                                        right:3vw;
                                                        top:16px;
                                                        font-size: 14px;
                                                        font-weight:700;
                                                        color:{op_color};
                                                        in: color 300ms ease-in-out;">
                                                {operation == "DEPOSIT" ?  ($lang === "EN" ? "HKD" : "港元") : ($lang === "EN" ? "TOKEN" : "通證幣")}
                                              </p>

                                              <!-- 左側操作文字 -->
                                              <p in:slide|={{ duration: 300 }}
                                                 style="filter: drop-shadow(0 0 4px #00000088);
                                                        position:absolute;
                                                        left:3vw;
                                                        top:16px;
                                                        font-size: 14px;
                                                        font-weight:700;
                                                        color:{op_color};
                                                        in: color 300ms ease-in-out;">
                                                {operation == "DEPOSIT" ?  ($lang === "EN" ? "PAY" : "交付") : ($lang === "EN" ? "PAY" : "消費")}
                                              </p>
                                            {/key}
                    
                    
                    
                                            <div style="position:absolute; top:48px; width:80vw; height:40px; 
                                                        display: flex; align-items: center; justify-content: space-between;
                                                        padding: 0 8px;">

                                                
                    
                                                <!-- 百分比按鈕 -->
                                                <div  style="display: flex; gap: 4px; width: 80%;z-index:160; opacity:{!amount && operation === "SPEND" ? 1 : 0};">
                                                    {#each [25, 50, 75, 100] as percent}
                                                        <button
                                                            on:click={() => setAmount(percent)}
                                                            style="
                                                                flex: 1;
                                                                height: 20px;
                                                                background: transparent;
                                                                border: 1px solid {op_color}88;
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
                                                    $ {formatVolume(user_balance, 0)} {coin_name}
                                                </div>
                                            </div>
                                        </div>
                        
                            
                                                <p in:slide={{ duration: 300 }} 
                                                   style="filter: drop-shadow(0 0 4px #00000088);
                                                          position:absolute;
                                                          {qrSvg ? 'left:3vw;' : 'right:3vw;'}
                                                          top:{qrSvg ? '36px' : '44px'};
                                                          font-size: {qrSvg ? '24px' : '14px'};
                                                          font-weight:700;
                                                          color:{qrSvg ? 'white' : op_color};
                                                          z-index:120;
                                                          gap:none;
                                                          opacity:{amount || operation === 'DEPOSIT' ? 1 : 0};
                                                          in: all 300ms ease-in-out; /* 新增這行 */">
                                                    {formatVolume(amount,2)} {operation === 'DEPOSIT' ? coin_name : 'HKD'}
                                                </p>
                                
                                                <p in:slide={{ duration: 300 }}
                                                   style="filter: drop-shadow(0 0 4px #00000088);
                                                          position:absolute;
                                                          left:3vw;
                                                          top:{qrSvg ? '12px' : '44px'};
                                                          font-size: {qrSvg ? '16px' : '14px'};
                                                          font-weight:700;
                                                          color:{op_color};
                                                          z-index:120;
                                                          opacity:{amount || operation === 'DEPOSIT' ? 1 : 0};
                                                          in: all 300ms ease-in-out; /* 新增這行 */">
                                                    {operation === 'DEPOSIT' ?  ($lang === "EN" ? "RECEIVING" : "換取") : ($lang === "EN" ? "PAYING" : "支付價值")}
                                                </p>
                        
                                                  <div in:blur={{ duration: 300 }} 
                                                    style="in: background 0.3s ease-in-out, color 0.3s ease-in-out, border 0.6s ease-in-out;
                                                           position:absolute; min-width:240px;
                                                           top:124px; height:auto; width:80vw; margin-left:0vw; border-radius: 16px;">
                                                                {#if qrSvg}
                                                                    
                                                                        <div in:blur={{ duration: 300 }} on:click={handleButtonClick}
                                                                        style="background:transparent; position: absolute; height:330px; width:330px;z-index:120; opacity: {insufficientBalance ? 0.1 : 1};
                                                                            margin-top:-12px; left:50%; transform: translateX(-50%); display: flex; align-items: center; justify-content: center;">
                                                                        {@html qrSvg}
                                                                        </div>
                                                                            
                                                                {:else if recentDeposits || recentSpends}

                                                                    <div 
                                                                      style="
                                                                        z-index: 300; 
                                                                        position: absolute; 
                                                                        top: 30px; 
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
                                                                        <button 
                                                                            on:click={() => {selectedIndex = index; amount = 0;
                                                                                        if (selectedIndex === 1 && !recentSpends) { getRecentSpends(); }
                                                                                        else if (selectedIndex === 1 && !recentDeposits) { getRecentDeposits(); }
                                                                                        else { return; }
                                                                                    }}
                                                                                     
                                                                              class="nav-button"
                                                                              style="opacity: {selectedIndex === index ? 1 : 0.2};"
                                                                        >
                                                                            <div style="margin-top:-10px; position: absolute;">
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
                                                                                                        style="width:128px;margin:16px;">
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
                                                                                                                <p style="position:absolute;white-space: nowrap;margin-top:{$lang === "ZH" ? "6px" :"4px"}; width:100%; line-height: 16px;">
                                                                                                                    {$lang === "ZH" ? "允許交易" : "Permit"} <br>{$lang === "ZH" ? "並生成二維碼" : "Transation"}</p>
                                                                                                          </div>
                                                                                                    </button>
                                                                                        
                                                                                          </div>

                                                                                        <p style="position:absolute; top:290px; font-size: {$lang === "ZH" ? "12px" : "10px"}; width:100%; min-width:280px; color:#888888; text-align: left;">
                                                                                            <span style="font-size: {$lang === "ZH" ? "12px" : "10px"};">
                                                                                                    {$lang === "ZH" 
                                                                                                     ? "致進階 Web3 用家 : " 
                                                                                                     : "To advanced Web3 users : "}
                                                                                            </span>
                                                                                            {$lang === "ZH" 
                                                                                             ? " '儲值' 及 '消費' 有別於一般區塊鏈轉賬，透過客製化 ERC20 合約邏輯，容許指定的商戶錢包地址對用戶錢包執行發行及銷毁動作，從而免除用戶的鏈上轉賬手續費，而 Permit 並沒有保管任何用戶的資產。" 
                                                                                             : " 'DEPOSIT' and 'SPEND' are customized contract logic that enables merchants to mint and burn tokens directly within user wallets to eliminate on-chain transfer fees, and Permit does not custody any user assets."}
                                                                                            <span style="font-size: {$lang === "ZH" ? "12px" : "10px"};">
                                                                                                    {$lang === "ZH" 
                                                                                                     ? "請在錢包應用添加代幣地址以使用一般轉賬功能。" 
                                                                                                     : "Please import token address in wallet app for normal transactions."}
                                                                                            </span>
        
                                                                                        </p>
                                                                                
                                                                            {:else if selectedIndex === 1}
                                                                            
                                                                                    <div  in:blur={{ duration: 300 }}  class="scroll-container" style="position:absolute; top:80px;">
                                                                                        <TX_table {user_address} {operation} {recentDeposits} {recentSpends} {op_color} TOKEN_contract={$TOKENContractAddress}/>
                                                                                    </div>

                                                                            {:else if selectedIndex === 2}
                                                                                    
                                                                                    <div in:blur={{ duration: 300 }} class="image-container" style="margin-left: -4vw;margin-top: 100px;display: flex;
                                                                                        justify-content: center;
                                                                                        align-items: center;">
                                                                                        <div in:blur={{ duration: 300 }} on:click={()=>{flowmap = false;}} class="scroll-container">
                                                                                            <img src="{operation === "DEPOSIT" ? DEPOSIT : SPEND }" 
                                                                                            class="dynamic-image" style="max-height:300px; max-width:300px; width:80vw;"
                                                                                            alt="infoimg"/>
                                                                                        </div>
                                                                                    </div>
                                                                                    
                                                                            {/if}
                                                                        
                                                                 
                                                                {:else if scanning  && merchantInfo.isFrozen === false}
                                                                    
                                                                    <div 
                                                                        in:blur={{ duration: 300 }} 
                                                                            style="in: background 0.3s ease-in-out, color 0.3s ease-in-out, border 0.6s ease-in-out;
                                                                            position:absolute; background:transparent; min-width:240px;
                                                                            top:0px; height:220px; width:80vw; margin-left:0vw; border-radius: 16px;">
                                                                        
                                                                                <video in:blur={{ duration: 300 }} 
                                                                                    bind:this={videoElement}
                                                                                    autoplay 
                                                                                    playsinline 
                                                                                    style="position: absolute; width: 100%; height: 100%; object-fit: cover; border-radius: 16px; opacity:0.68; margin-top:-16px;">
                                                                                </video>
                                                                        
                                                                    </div>
                                                                
                                                                {/if}
                                                  </div>
                        
                                
                                </div>
                        
                                <a in:blur={{ duration: 300 }}  href="https://basescan.org/address/{$TOKENContractAddress}" 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   style="
                                     text-decoration: {target_address === contract_address && operation !== "DEPOSIT" ? "underline" : "none"}; 
                                     position:absolute; 
                                     left:50%; 
                                     width:80vw; 
                                     top:154px; 
                                     transform: translateX(-50%); 
                                     font-size: 12px; opacity:{qrSvg ? 0.666666 : 1};
                                     color: {insufficientBalance ? '#ff4444' : op_color};
                                     in: color 0.3s ease-in-out;
                                   ">
                                   {#if insufficientBalance}
                                       Insufficient {coin_name} balance
                                   {:else}
                                       {qrSvg ? ($lang === "ZH" ? "請出示此二維碼予商家完成交易" : "Show QR code to merchant") : ($lang === "ZH" ? "請輸入金額並生成交易二維碼" : "Input amount to generate QR code")}
                                   {/if}
                                </a>

                                <p in:blur={{ duration: 300 }} 
                                   style="
                                     text-decoration: {target_address === contract_address && operation !== "DEPOSIT" ? "underline" : "none"}; 
                                     position:absolute; 
                                     left:50%; 
                                     width:80vw; 
                                     top:490px; 
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
                            
                                <div in:blur={{ durFation: 300 }}>                
                                    <Merchants />
                                </div>
                            
                        {:else}
                            
                                <div in:blur={{ durFation: 300 }}>                
                                    <INFO_table 
                                        {user_balance}
                                        {lp_balance}
                                        {coin_name}
                                        {totalSupply}
                                        {totalMinted}
                                        {totalBurnt}
                                        contract={$TOKENContractAddress}
                                        coin_price={0.128205}
                                        price_unit={"USDC"}/>
                                </div>

                                <img on:click={openUniswapTab} src={US} alt="US"  style="position: absolute; height:22px; bottom:186px;left:calc(45vw - 60px);filter: drop-shadow(0 0 4px #eb7af8);"/>
                                <p on:click={openUniswapTab} style="position: absolute; font-size:12px; height:40px; bottom:160px;left:calc(45vw - 32px);filter: drop-shadow(0 0 4px #eb7af8);"> on Uniswap V4</p>



                                <button on:click={openUniswapTab} transition:fade={{ duration: 300 }} class="main_button_tx pushable button-11 gold-border"
                                           style=" background:linear-gradient(#8CFFFB44, #ccacf844);  position: absolute; bottom:120px;
                                            font-weight: 700; cursor: pointer; z-index:3000;">
                                          <div class="button-11__content" transition:fade={{ duration: 300 }}  style="filter: drop-shadow(0 0 2px #eb7af8);border:1px solid #eb7af8;">
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

                    <button on:click={toggleMerchants} transition:fade={{ duration: 300 }} class="main_button_tx pushable button-11 gold-border"
                               style=" background:linear-gradient(#8CFFFB44, #ccacf844);  position: absolute; bottom:48px;
                                font-weight: 700; cursor: pointer; z-index:3000;">
                              <div class="button-11__content" transition:fade={{ duration: 300 }}  style="filter: drop-shadow(0 0 2px #FFFFFF);">
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
        right: 5vw;
        color: var(--op-color);
        margin-top:-2px;
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