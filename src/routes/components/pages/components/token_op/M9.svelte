<script>
    import { ethers } from "ethers"; // 確保你使用的是 Ethers.js
    import { onMount } from "svelte";
    import { fade, scale, slide , blur } from "svelte/transition";
    import M9_logo from "../tokens/M9.png";
    import { refer_address , BASE, BASE_CHAIN_ID, BASE_PARAMS , 
          M9ContractAddress, M9ABI} from '../../../../store.js';
    import QrcodeDecoder from "qrcode-decoder";
    export let coin_name;
    export let coinbase;
    export let eth_price;
    export let user_eth_balance;
    export let user_address;
    let tempMessage = null;
    let chain_name = "BASE"
    let lastTxHash = null;
    let coin_BUY; // 需要使用多少粒 ETH / SOL / TON 購買
    let coin_SELL; // 出售將會收回多少粒 ETH / SOL / TON
    let totalsupply;
    let circulatingsupply;
    let claimable;
    let operation = "ASK";
    let op_color = "#ccacf8";
    let tokenBalance; // user token balance
    let amount = 0; // 输入框绑定的值，初始为 0
    $: progress = circulatingsupply * 100 / totalsupply;
    let memo;
    $: Output  = operation === "BUY" 
        ? (amount * eth_price) / coin_BUY
        : amount;
    $: formattedOutput = formatVolume(Output, 2);
    $: formattedUSD = formatVolume(USD_value, 2);
    $: formattedSellETH = operation == "SELL" ? formatVolume(amount * coin_SELL / (10 ** 18), 2) : "";
    $: USD_value = operation === "BUY" 
        ? eth_price * amount
        : amount * coin_BUY;
    $: disabled = operation !== "SEND";
    $: address_placeholder = operation === "SEND" ? "Or paste target address here" : "With contract built-in liquidity." ;    
    $: target_address = operation === "SEND" ? null : contract_address ;
    $: contract_address = coin_name == "M9" 
        ? "0xcontractaddress" : "";
    $: coinbase_name = coin_name === "M9" 
        ? "ETH" : "";
    // 🎯 確保 CLAIM 模式的數字格式正確，避免渲染錯誤
    $: claim_display = `
        ${operation} = ${formatVolume(claimable * 0.0001, 2)}
        <span class="rgb-text" style="font-size:12px;">${identifyBlockchainAddress($refer_address) === "EVM" ? "+" + formatVolume(claimable * 0.00001, 2) : ""}</span> 
        ${coin_name} ≈ ${formatVolume(coin_BUY, 2)}
        <span class="rgb-text" style="font-size:12px;">${identifyBlockchainAddress($refer_address) === "EVM" ? "+" + formatVolume(coin_BUY * 0.1, 2) : ""}</span> 
        USD
    `;
    // 🎯 確保 BUY / SELL / SEND / ASK 模式的數字格式正確
    $: operation_display = `
        ${operation} = ${formatVolume(Output, 2)}
        <span class="rgb-text" style="font-size:12px;">${identifyBlockchainAddress($refer_address) === "EVM" && operation == "BUY" ? "+" + formatVolume(Output * 0.1, 2) : ""}</span> 
        ${coin_name} ≈ ${operation == "SELL" 
            ? formatVolume(amount * coin_SELL * eth_price / (10 ** 18), 2) 
            : formatVolume(USD_value, 2)}
        <span class="rgb-text" style="font-size:12px;">${identifyBlockchainAddress($refer_address) === "EVM" && operation == "BUY" ? "+" + formatVolume(USD_value * 0.1, 2) : ""}</span> 
        USD 
        ${operation == "SELL" ? `( ${formatVolume(amount * coin_SELL / (10 ** 18), 2)} ETH )` : ""}
    `;
    let qrSvg = null;
    let scanning = false;
    let videoStream = null;
    let videoElement = null;
    let qrDecoder = new QrcodeDecoder();
    let OK = false;

    // 創建合約實例
    const M9_contract = new $BASE.eth.Contract($M9ABI, $M9ContractAddress);
    
    /** 
     * **獲取可領取的 M9 數量**
     * @returns {Promise<number>} 返回扣除 18 位小數後的可領取 M9 數量
     */
    const fetchM9Claimable = async () => {
        try {
            const claimableAmount = await M9_contract.methods.claimable().call();
            return Number(claimableAmount) / Math.pow(10, 18); // 扣除 18 位小數
        } catch (error) {
            // // console.error("🚨 獲取 M9 可領取數量失敗:", error);
            return 0;
        }
    };
  
    /** 
     * **獲取 1 ETH 可兌換的 M9 數量**
     * @returns {Promise<number>} 返回 M9 數量
     */
    const fetch1ETHtoM9 = async () => {
        try {
            const purchaseAmount = await M9_contract.methods.calculatePurchaseAmount().call();
            return Number(purchaseAmount);
        } catch (error) {
            // // console.error("🚨 獲取 1 ETH 可兌換 M9 數量失敗:", error);
            return 0;
        }
    };

    const fetch1M9toETH = async () => {
        try {
            const purchaseAmount = await M9_contract.methods.calculateSellAmount().call();
            return Number(purchaseAmount);
        } catch (error) {
            // // console.error("🚨 獲取 1 ETH 可兌換 M9 數量失敗:", error);
            return 0;
        }
    };
  
    const fetchTotalSupply = async () => {
        try {
            const supplyBigInt = await M9_contract.methods.totalSupply().call(); // 🛑 這是 BigInt
            const supplyNumber = Number(supplyBigInt.toString()) / 10 ** 18; // ✅ 顯式轉換為 number
            totalsupply = supplyNumber; // ✅ 更新 totalsupply
  
            // // console.log(`📢 總供應量 (totalSupply): ${totalsupply}`);
            return supplyNumber;
        } catch (error) {
            // // console.error("🚨 獲取總供應量失敗:", error);
            return 0;
        }
    };

  const fetchCirculatingSupply = async () => {
      try {
          const supplyBigInt = await M9_contract.methods.circulatingSupply().call(); // 🛑 這是 BigInt
          const supplyNumber = Number(supplyBigInt.toString()) / 10 ** 18; // ✅ 顯式轉換為 number
            circulatingsupply = supplyNumber; // ✅ 更新 totalsupply

          // // console.log(`📢 總供應量 (totalSupply): ${totalsupply}`);
          return supplyNumber;
      } catch (error) {
          // // console.error("🚨 獲取總供應量失敗:", error);
          return 0;
      }
  };

  const fetchTokenBalance = async () => {
      try {
          const supplyBigInt = await M9_contract.methods.balanceOf(user_address).call(); // 🛑 這是 BigInt
          const supplyNumber = Number(supplyBigInt.toString()) / 10 ** 18; // ✅ 顯式轉換為 number
            tokenBalance = supplyNumber; // ✅ 更新 totalsupply

          // console.log(`📢 User Balance (supplyNumber): ${supplyNumber}`);
          return supplyNumber;
      } catch (error) {
          // // console.error("🚨 獲取總供應量失敗:", error);
          return 0;
      }
  };
  
    /**
     * **確保用戶連接的區塊鏈為 Base Sepolia Testnet**
     * @returns {Promise<boolean>} - `true` 表示已在正確鏈上，`false` 表示用戶拒絕切換
     */
    async function ensureCorrectChain() {
        if (!window.ethereum) {
            // // alert("❌ 請安裝 MetaMask 或其他 EVM 錢包");
            return false;
        }
        try {
          // 🔹 創建 provider & signer
            const provider = new ethers.BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();
            const currentChainId = `0x${network.chainId.toString(16)}`;
  
            // 🔍 如果當前鏈 ID 正確，直接返回 `true`
            if (currentChainId === $BASE_CHAIN_ID) return true;
            // // console.warn(`🚨 當前鏈 ID: ${currentChainId}，目標鏈 ID: ${$BASE_CHAIN_ID}`);
            // 🔹 嘗試切換到 `84532`
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: $BASE_CHAIN_ID }],
            });
            // // console.log("✅ 已切換至 Base Sepolia Testnet");
            return true;
        } catch (error) {
            // 🛑 如果錯誤代碼是 4902，表示該鏈不存在於用戶錢包，則請求手動添加
            if (error.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [$BASE_PARAMS],
                    });
                    // // console.log("✅ Base Sepolia Testnet 已新增並切換");
                    return true;
                } catch (addError) {
                    // // console.error("🚨 手動新增 Base Sepolia Testnet 失敗:", addError);
                    // alert("❌ 無法新增 Base Sepolia Testnet，請手動添加");
                    return false;
                }
            }
            // // console.error("🚨 切換鏈 ID 失敗:", error);
            // alert("❌ 需要切換到 Base Sepolia Testnet 來繼續操作");
            return false;
        }
    }
    
    async function claimM9() {
        try {
            if (!window.ethereum) {
                return;
            }
  
          // 🛑 **檢查並確保鏈 ID 正確**
            const isCorrectChain = await ensureCorrectChain();
            if (!isCorrectChain) return;
  
          // 🔹 創建 provider & signer
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
  
            // 🔹 取得使用者的 EVM 錢包地址
            const userAddress = await signer.getAddress();
  
            // 🔹 確保用戶授權並獲取帳戶
            if (!userAddress) {
                // alert("❌ 未偵測到有效的 EVM 錢包帳戶");
                return;
            }
  
            // 取得推薦地址（若無推薦人則使用 0x000...000）
            const referrer = $refer_address || ethers.ZeroAddress;
  
            // 🔹 創建合約實例
            const M9_contract = new ethers.Contract($M9ContractAddress, $M9ABI, signer);
  
            // 🔹 發送交易
            const tx = await M9_contract.claimM9(referrer);
  
            // 🔄 等待交易確認
            await tx.wait();
            lastTxHash = tx.hash;

            setTimeout(() => {
                lastTxHash = "";
            }, 1500);
  
            // 🔄 更新可領取的 M9 數量
            claimable = await fetchM9Claimable();
        } catch (error) {
            lastTxHash = "";
            // // console.error("🚨 領取 M9 失敗:", error);
            // alert("❌ 領取 M9 失敗，請檢查網絡連接或餘額。");
        }
    }

  async function buyM9() {
      try {
          if (!window.ethereum) {
              return;
          } else if (user_eth_balance < amount) {
            lastTxHash = "🤡"
          }

          // 🛑 **檢查並確保鏈 ID 正確**
          const isCorrectChain = await ensureCorrectChain();
          if (!isCorrectChain) return;

          // 🔹 創建 provider & signer
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();

          // 🔹 取得使用者的 EVM 錢包地址
          const userAddress = await signer.getAddress();

          // 🔹 確保用戶授權並獲取帳戶
          if (!userAddress) {
              return;
          }

          // 取得推薦地址（若無推薦人則使用 0x000...000）
          const referrer = $refer_address || ethers.ZeroAddress;

          // 🔹 確保 `amount` 有效
          if (!amount || isNaN(amount) || amount <= 0) {
              alert("❌ 請輸入有效的購買數量");
              return;
          }
        
          // 🔹 計算 `value`（ETH 轉換為 Wei，18 位小數）
          const valueInWei = ethers.parseUnits(amount.toString(), 18);

          // 🔹 創建合約實例
          const M9_contract = new ethers.Contract($M9ContractAddress, $M9ABI, signer);

          // 🔹 發送交易，並傳遞 `value`
          const tx = await M9_contract.buyM9(referrer, { value: valueInWei });

          // 🔄 等待交易確認
          await tx.wait();
          lastTxHash = tx.hash;

          // ✅ 3 秒後清除交易哈希
          setTimeout(() => {
              lastTxHash = "";
          }, 1500);

      } catch (error) {
          lastTxHash = "";
          // // console.error("🚨 購買 M9 失敗:", error);
          // alert("❌ 購買 M9 失敗，請檢查網絡連接或餘額。");
      }
  }

  async function sendM9() {
    lastTxHash = "Loading";
      try {
          if (!window.ethereum) {
              return;
          } else if (tokenBalance < amount) {
              lastTxHash = "🤡";
              return;
          }

          // 🛑 **確保鏈 ID 正確**
          const isCorrectChain = await ensureCorrectChain();
          if (!isCorrectChain) return;

          // 🔹 創建 provider & signer
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();

          // 🔹 取得目標地址（確保是有效 EVM 地址）
          let target = target_address || ethers.ZeroAddress;
          if (!ethers.isAddress(target)) {
              alert("❌ 目標地址無效，請輸入有效的 EVM 地址");
              return;
          }

          // 🔹 確保 `amount` 有效
          if (!amount || isNaN(amount) || amount <= 0) {
              //  alert("❌ 請輸入有效的轉帳數量");
              return;
          }

          // 🔹 創建 ERC-20 代幣合約實例
          const M9_contract = new ethers.Contract($M9ContractAddress, $M9ABI, signer);

          // 🔹 發送 ERC-20 `transfer()` 交易
          const tx = await M9_contract.transfer(target, ethers.parseUnits(amount.toString(), 18));

          // 🔄 等待交易確認
          await tx.wait();
          lastTxHash = tx.hash;

          // ✅ 3 秒後清除交易哈希
          setTimeout(() => {
              lastTxHash = "";
          }, 1500);

      } catch (error) {
          // // console.error("❌ 轉帳失敗:", error);

          // if (error.code === "INSUFFICIENT_FUNDS") {
          //     alert("❌ 餘額不足，請確保你的 M9 代幣足夠！");
          // } else if (error.code === "CALL_EXCEPTION") {
          //     alert("❌ 交易被智能合約拒絕，請檢查目標地址是否正確！");
          // } else if (error.code === "-32603") {
          //     alert("❌ RPC 內部錯誤，請稍後重試！");
          // } else {
          //     alert("❌ 轉帳失敗，請檢查輸入值或網絡狀態！");
          // }

          lastTxHash = "";
      }
  }
  
    async function action() {
          if (operation === "CLAIM") {
                    lastTxHash = "Loading";
                    // setTimeout(() => {
                    //     lastTxHash = "";
                    // }, 1500);
                    await claimM9();
          } else if (operation === "BUY") {
                    lastTxHash = "Loading";
                    // setTimeout(() => {
                    //     lastTxHash = "";
                    // }, 1500);
                    await buyM9();
          } else if (operation === "SEND") {
                    lastTxHash = "Loading";
                    // setTimeout(() => {
                    //     lastTxHash = "";
                    // }, 1500);
                    await sendM9();
          } else if (operation === "SEND") {
                    lastTxHash = "Loading";
                    // setTimeout(() => {
                    //     lastTxHash = "";
                    // }, 1500);
                    // await sellM9();
          } else if (operation === "ASK") {
                    qrSvg ? resetQRCode() : generateQRCode();      
          } else {
                    // // console.log("執行其他操作:", operation);
                    // 這裡可以擴展其他操作邏輯（如 BUY, SELL, SEND）
          }
    }


      let checkTxInterval = null; // ⏳ 用來存放 interval ID
      let checkTxAttempts = 0; // 🔄 計算檢查次數（最多 10 次）
        
      // 🏆 檢查區塊鏈是否有符合的交易
      async function checkBlockchainForTx() {
          if (!user_address || !contract_address || !amount) return;
    
          try {
              // 🔍 使用 Ethers.js 創建 provider
              const provider = new ethers.BrowserProvider(window.ethereum);
    
              // 🟢 **改為獲取最新區塊號，避免 "latest" 問題**
              const latestBlock = await provider.getBlockNumber();
              const startBlock = latestBlock - 50; // 🔎 檢查最近 50 個區塊
    
              // 📜 獲取最近的交易記錄
              const logs = await provider.getLogs({
                  address: contract_address, // 目標智能合約地址
                  fromBlock: startBlock, // 🔍 從最新的 50 個區塊開始檢查
                  toBlock: "latest"
              });
    
              for (let log of logs) {
                  // 🔹 解析交易事件
                  const tx = await provider.getTransaction(log.transactionHash);
    
                  if (tx && tx.from.toLowerCase() === user_address.toLowerCase()) {
                      // console.log("✅ 匹配交易發現，交易 Hash:", tx.hash);
                      lastTxHash = tx.hash; // 🔥 更新交易 Hash
                      clearInterval(checkTxInterval); // ⏹️ 停止檢查
                      return;
                  }
              }
    
              // 🔄 增加檢查次數，最多 10 次
              checkTxAttempts++;
              if (checkTxAttempts >= 10) {
                  // console.log("🚨 超過 10 次檢查，未找到匹配交易，停止檢測。");
                  clearInterval(checkTxInterval);
              }
    
          } catch (error) {
              // console.error("❌ 檢查區塊鏈交易時出錯:", error);
          }
      }

  

        function toggleCamera() {
          if (scanning) {
            stopCamera();
          } else {
            amount = 0;
            target_address = "";
            startCamera();
          }
        }
        stopCamera();

        async function startCamera() {
          try {
            scanning = true;
            videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            videoElement.srcObject = videoStream;
            videoElement.play();
            decodeQRCodeLoop();
          } catch (err) {
            // // console.error("Camera access denied:", err);
            scanning = false;
          }
        }

        // 🛑 `stopCamera` 會停止交易監測
        function stopCamera() {
            if (videoStream) {
                videoStream.getTracks().forEach(track => track.stop());
                videoStream = null;
            }
            scanning = false;
      
            // ⏹️ 停止交易檢查
            if (checkTxInterval) {
                clearInterval(checkTxInterval);
            }
        }

      async function decodeQRCodeLoop() {
        while (scanning) {
          try {
            const result = await qrDecoder.decodeFromVideo(videoElement);
            if (result.data) {
              await parseScannedData(result.data);
              stopCamera();
              break;
            }
          } catch (err) {
            // // console.error("QR Code scanning error:", err);
          }
          await new Promise(resolve => setTimeout(resolve, 1000)); // 每 1 秒掃描一次，節省電力
        }
      }

      async function parseScannedData(data) {
        try {
          const parsedData = JSON.parse(data);
          if (parsedData.contract && parsedData.amount && parsedData.receiver) {
            contract_address = parsedData.contract;
            amount = parsedData.amount / 10 ** 18;
            target_address = parsedData.receiver;
            await sendM9();
          } else {
            // alert("無效的 QR Code 數據");
          }
        } catch (err) {
          // alert("QR Code 解析失敗");
          // // console.error("Invalid QR Code data:", err);
        }
      }
        import QRCode from "qrcode-svg";
        import Bg from "../assets/ton_invest_power_bg.mp4";
        import Copy from "../assets/Copy_icon.svelte";

      // 生成 QR Code 的數據
      $: qrData = JSON.stringify({
        contract: contract_address,
        amount: amount * 10 ** 18, // 轉換為區塊鏈格式的 18 位小數
        receiver: user_address,
      });

      // 自動生成 QR Code
      $: generateQRCode();


      // 🎯 生成 QR Code 並啟動交易監測
      function generateQRCode() {
          if (operation === "ASK" && contract_address && user_address && amount > 0) {
              const qr = new QRCode({
                  content: qrData,
                  width: 240,
                  height: 240,
                  color: op_color,
                  background: "transparent",
                  join: true,
              });
              qrSvg = qr.svg();
    
              // 🔄 重置檢查計數
              checkTxAttempts = 0;
    
              // ⏳ 每 3 秒檢查一次區塊鏈
              checkTxInterval = setInterval(checkBlockchainForTx, 3000);
          }
      }

      // 重置 QR Code 並將 amount 設為 0
      function resetQRCode() {
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
            if(operation === "BUY"){
                amount = round((user_eth_balance * percentage) / 100, 2);
            } else if (operation === "SELL" || operation === "SEND"){
                amount = round((tokenBalance * percentage) / 100, 2);
            }
      }

      function round(value, decimals) {
        return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
      }

      function formatVolume(value, float) {
        if (!value || isNaN(value) || value == null || value == 0 ) {
            return 0;
        } else if (value >= 1000000000000) {
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
      // Function to copy the full wallet address
      function copyFullAddress(address) {
          navigator.clipboard.writeText(address); // Copy to clipboard
          tempMessage = `Address Copied 👌🏻`;
          setTimeout(() => {
            tempMessage = null; // Reset message
          }, 3000);
      };

    function copyAndShareReferLink() {
        const referLink = `https://permit.money/?address=${$refer_address}`;
        // **1️⃣ 複製 refer 連結到剪貼簿**
        navigator.clipboard.writeText(referLink).then(() => {
            // **2️⃣ 按鈕文字變為 "Address Copied"**
            tempMessage = "Address Copied";

            // **3️⃣ 3 秒後恢復原始文字**
            setTimeout(() => {
                tempMessage = null;
            }, 3000);

            // **4️⃣ 嘗試開啟分享功能**
            if (navigator.share) {
                navigator.share({
                    title: "Join Permit Community!",
                    text: `On-borad for your VIP membership: ${referLink}`,
                    url: referLink
                }).catch((error) => {
                    // // console.warn("分享功能被取消或不支援", error);
                });
            } else {
                // // console.log("此裝置不支援 `navigator.share()`");
            }
        }).catch(err => {
            // // console.error("複製失敗:", err);
        });
    }

  // function toggleNet() {
  //     if ($BASE_CHAIN_ID === "0x14A34") {
  //         // ✅ 切換到 Base Mainnet
  //         M9ContractAddress.set("0xYourMainnetContractAddress"); // 🛑 替換為 Mainnet 智能合約地址
  //         BASE_CHAIN_ID.set("0x2105");
  //         BASE_PARAMS.set({
  //             chainId: "0x2105",
  //             chainName: "Base Mainnet",
  //             nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  //             rpcUrls: ["https://mainnet.base.org"],
  //             blockExplorerUrls: ["https://basescan.org"],
  //         });
  //     } else {
  //         // ✅ 切換回 Base Testnet
  //         M9ContractAddress.set("0x02b886D26dd01c3531d22bB9c158052a2ad54b73");
  //         BASE_CHAIN_ID.set("0x14A34");
  //         BASE_PARAMS.set({
  //             chainId: "0x14A34",
  //             chainName: "Base Testnet",
  //             nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  //             rpcUrls: ["https://sepolia.base.org"],
  //             blockExplorerUrls: ["https://sepolia.basescan.org"],
  //         });
  //     }
  // }

    onMount(async () => {
        try {
            await Promise.all([
                fetchTokenBalance(),
                fetchTotalSupply(),
            ]);
        } catch (error) {
        }
    });

</script>


<!-- {#if user_eth_balance <= 0.001}
    
    <div in:blur={{ duration: 300 }} class=""
      style="position:fixed; width:90vw; min-width:240px; z-index:1100; border-top: 1.5px solid #444444;background:linear-gradient(#111111, #000000);
          top:120px; bottom:24px; left:5vw; height:auto; margin:auto; border-radius: 28px; overflow-y: auto;cursor:pointer;"
    >
     <div style="z-index:3; position:absolute; top:-80px; width:80vw; margin-left:5vw;  height:56px; min-width:240px; display: flex; align-items: center; justify-content: space-around;">
        <p class="gold-text" style="position: absolute; top:200px;z-index:1110;">Insufficient ETH on {chain_name}</p>
         <p style="position: absolute; top:240px; font-size:12px; z-index:1110;">You need at least 0.001 ETH to claim ${coin_name} airdrop, and at least 0.1 ETH to purchase ${coin_name}, please copy and deposit to {chain_name} with your address.</p>
    </div>

        <button 
          on:click={copyFullAddress(user_address)}
          on:keydown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') { 
              copyFullAddress(user_address);
            }
          }}
          style="
            position: absolute;
            background: transparent; 
            height: 56px; /* 修正高度為正常按鈕尺寸 */
            width: 70vw;
            max-width: 300px;
            top: 390px;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex; 
            justify-content: center; 
            align-items: center; 
            border: 4px dotted; 
            margin: 0; 
            padding: 0;
            cursor: pointer;" 
          aria-label="Copy EVM Wallet Address"
        >
          <span 
            style="display: flex; 
                   font-weight: 700; 
                   color: white; 
                   font-size: 14px; 
                   margin: 12px; 
                   filter: drop-shadow(0 0 32px rgba(255, 255, 255, 1));">
            <Copy/> <span style="margin-top:6px;">{tempMessage ? tempMessage : user_address.slice(0, 8) + "..." + user_address.slice(-8) }</span>
          </span>
        </button>

    
    </div>
    
{:else  -->
{#if lastTxHash}

      <video
        autoplay 
        loop 
        muted 
        playsinline transition:blur={{ duration: 300 }} 
        style="
          position: absolute; 
          width: 100%; 
          height: 100%; 
          object-fit: cover;
          border-left: 0px solid;
          border-right: 0px solid;
          border-radius: 16px; 
          z-index: 1100;">
        <source src={Bg} transition:blur={{ duration: 300 }}  type="video/mp4" />
      </video>

    {#if lastTxHash === "Loading" }
    
        <!-- 🎉 文字內容，放在影片上方，置中顯示 -->
        <div transition:blur={{ duration: 300 }}  style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        z-index: 1200;
        ">
            <!-- 🎉 成功訊息 -->
            <p in:blur={{ duration:300 }} class="gold-text" style="font-size: 20px; font-weight: bold; color: #FFD700;">
              Initiating Transaction
            </p>
        </div>
      
    {:else if lastTxHash === "🤡" }

        <!-- 🎉 文字內容，放在影片上方，置中顯示 -->
        <div in:blur={{ duration: 300 }}  style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        z-index: 1200;
        ">
          {#if operation === "BUY"}
              <p class="gold-text" style="font-size: 20px; font-weight: bold; color: #FFD700;">
              Available ETH : {formatVolume(user_eth_balance,2)}
              </p>
          {:else}
              <p class="gold-text" style="font-size: 20px; font-weight: bold; color: #FFD700;">
              Available {coin_name} : {formatVolume(tokenBalance,2)}
              </p>
          {/if}
        </div>
      
    {:else}

      <!-- 🎉 文字內容，放在影片上方，置中顯示 -->
      <div in:blur={{ duration:300 }} on:click={()=>{lastTxHash="";}} style="
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      z-index: 1200;
      ">
          <!-- 🎉 成功訊息 -->
          <p in:blur={{ duration:300 }} class="gold-text" style="font-size: 20px; font-weight: bold; color: #FFD700;">
            Transaction Completed
          </p> <br/>
          <!-- 🔗 交易鏈接 -->
          <a in:blur={{ duration:300 }} href="https://basescan.org/tx/{lastTxHash}" target="_blank" rel="noopener noreferrer"
          style="color: #FFD700; font-size: 14px; text-decoration: underline;">
            View on BaseScan 🔗
          </a>
      </div>
    {/if}
   
{/if}



















<div style="position:fixed; top:40px; left:0; z-index: 999; 
            height:100vh; width:100vw; background: #000000; ">

    <!-- 第1部分 -->
    <img on:click={()=>{toggleNet();}} src={M9_logo} alt="M9_logo" style="position:fixed; width:56px; height:56px; border-radius:56px; top:45px; left:5vw; z-index: 29;"/>
    <p  style="position:fixed; left:calc(5vw + 68px); top:32px; font-size:32px;"> {coin_name} <span>({chain_name})</span></p>
    <p  style="position:fixed; left:calc(5vw + 68px); top:80px; font-size:12px; color:#cccccc;"> Price: {formatVolume(coin_BUY,2)} USD 
      <span style="font-size:12px; color:#888888;">Cap:  {formatVolume(coin_BUY * eth_price * totalsupply,2)}</span></p>
    <!-- <p  style="position:fixed; left:calc(5vw + 168px); top:80px; font-size:12px; color:#FF0000;"> {formatVolume(coin_SELL,2)} {coinbase_name}</p> -->


    
    <!-- 最外層的 box -->
    <div in:blur={{ duration: 300 }} 
      style="position:fixed; width:90vw; min-width:240px; filter: drop-shadow(0 0 8px {op_color}22); border-top: 1.5px solid #444444;background:linear-gradient(#111111, transparent);
          top:120px; bottom:24px; left:5vw; height:auto; margin:auto; border-radius: 28px; overflow-y: auto;cursor:pointer;"
    >

        <!-- The function box -->
        <div 
          transition:blur={{ duration: 600 }} 
          style="
            z-index: 3; 
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

              { name: "ASK", color: "#ccacf8" },
              { name: "SEND", color: "#8CFFFB" }
          ] as btn}
            <button 
              on:click={() => { 
                  qrSvg = null;
                  operation = btn.name; 
                  op_color = btn.color; 
                  amount = 0; 
                  stopCamera();
                  if (btn.name === "SEND") target_address = null; 
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
                    border-radius: 12px;
                    border-top: 1px solid {operation == btn.name ? "#FFFFFF88" : '#000000CC'};
                    border-bottom: 2px solid #00000088;
                      background: {operation == btn.name 
                          ? `radial-gradient(circle, white 0%, ${op_color} 100%)` 
                          : 'transparent'};
                    opacity: {operation == btn.name ? '1' : '0.33'};
                    transition: background 0.3s ease-in-out, color 0.3s ease-in-out, opacity 0.3s ease-in-out;
                    white-space: nowrap;  
                    overflow: hidden; 
                    text-overflow: ellipsis; 
              "
            >
              <span style="margin-top:6px;color: {operation == btn.name ? '#000000' : btn.color};
                           font-weight: 700;
                           font-size: 14px;">
                {btn.name}</span>
            </button>
          {/each}
        </div>


        <!-- The top box below the function box -->
        <div transition:blur={{ duration: 600 }}  style="transition: background 0.3s ease-in-out, color 0.3s ease-in-out, border 0.6s ease-in-out;
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

{#if operation === "BUY" || operation === "SELL" || operation === "SEND" || operation === "ASK"}
                <div style="opacity: {qrSvg || scanning ? 0.33 : 1}; pointer-events: {qrSvg && operation === "SEND" ? 'none' : 'auto'};">
                  <input
                    type="number"
                    bind:value={amount}
                    placeholder="Operation Amount"
                    disabled={operation === "SELL" && circulatingsupply / totalsupply < 0.99 || qrSvg !== null || scanning}
                    style="
                      margin-left:16px;
                      position: absolute;
                      left: 50%;
                      transform: translateX(-50%);
                      filter: drop-shadow(0 0 4px #00000088);
                      width: 80vw;
                      height: 40px;
                      padding: 0;
                      color:white;
                      font-size: 28px;
                      font-weight: 700;
                      text-align: center;
                      line-height: 40px;
                      margin-top: 8px;
                      background: none;
                      opacity: {operation === 'SELL' && circulatingsupply / totalsupply < 0.99 || qrSvg ? 0.5 : 1};
                    "
                  />
            
                  <p style="filter: drop-shadow(0 0 4px #00000088);position:absolute; right:3vw;top:16px; font-size: 16px; font-weight:700; color:{op_color};">
                    {operation == "BUY" ? coinbase_name : coin_name}
                  </p>
                  <p style="filter: drop-shadow(0 0 4px #00000088);position:absolute; left:3vw;top:16px; font-size: 16px; font-weight:700; color:{op_color};">
                    {operation == "BUY" ? "PAY" : operation}
                  </p>
                </div>
              <!-- The top box 控制數值的按钮组 -->
                {#if operation === "ASK"}
    
                            <p class="{qrSvg ? "gold-text" : ""}" style="filter: drop-shadow(0 0 4px #00000088); position:absolute; right:3vw;top:48px; font-size: 20px; font-weight:700; color:white; z-index:120;">
                                ≈ {formatVolume(USD_value,2)} USD
                            </p>
                            <p style="filter: drop-shadow(0 0 4px #00000088); position:absolute; left:3vw;top:44px; font-size: 16px; font-weight:700; color:{op_color}; z-index:120;">
                                FOR
                            </p>
                    
                {:else if operation === "BUY" || operation === "SELL" || operation === "SEND"}
                    
                            <div 
                              style="position:absolute; left:2vw; width:50vw; max-width:250px; bottom: 2px; display: flex; justify-content: space-between;">
                                    <button disabled={(operation === "SELL" && (circulatingsupply / totalsupply < 0.99 || !amount))}
                                        on:click={() => setAmount(25)}
                                        style="flex: 1; padding: 4px; font-size: 10px; font-weight:700; background-color: none; border: none; cursor: pointer;"
                                        >  25%
                                    </button>
                                    <button disabled={(operation === "SELL" && (circulatingsupply / totalsupply < 0.99 || !amount))}
                                        on:click={() => setAmount(50)}
                                        style="flex: 1; padding: 4px; font-size: 10px; font-weight:700; background-color: none; border: none; cursor: pointer;"
                                        > 50%
                                    </button>
                                    <button disabled={(operation === "SELL" && (circulatingsupply / totalsupply < 0.99 || !amount))}
                                        on:click={() => setAmount(75)}
                                        style="flex: 1; padding: 4px; font-size: 10px; font-weight:700; background-color: none; border: none; cursor: pointer;"
                                        > 75%
                                    </button>
                                    <button disabled={(operation === "SELL" && (circulatingsupply / totalsupply < 0.99 || !amount))}
                                        on:click={() => setAmount(100)}
                                        style="flex: 1; padding: 4px; font-size: 10px; font-weight:700; background-color: none; border: none; cursor: pointer;"
                                        > 100%
                                    </button>
                            </div>
    
                            <p style="position:absolute; right:3vw;bottom:5px; font-size: 12px;"> 
                                of ~ {operation == "BUY" ? formatVolume(user_eth_balance,1) : formatVolume(tokenBalance,1)} 
                                {operation == "BUY" ? coinbase_name : coin_name}</p>
                            <!-- BUY / SELL / SEND / ASK 模式的顯示 -->
                            {#if amount}
                                <p key={amount} style="position:absolute; 
                                        left:50%; width:80vw; top:92px; 
                                        transform: translateX(-50%); 
                                        font-size: 12px; 
                                        color:{op_color};">
                                    {@html operation_display}
                                </p>
                            {/if}
                {/if}
    
                        {#if operation === "ASK" || operation === "SEND"}
                          <div 
                            in:blur={{ duration: 600 }} 
                            style="transition: background 0.3s ease-in-out, color 0.3s ease-in-out, border 0.6s ease-in-out;
                                   position:absolute; min-width:240px;
                                   top:124px; height:auto; width:80vw; margin-left:0vw; border-radius: 16px;">

                            <!-- 如果是 ASK，顯示 QR Code -->
                            {#if operation === "ASK"}
                              {#if qrSvg}


                              {:else if amount === 0}
                                   <p in:blur={{ duration: 600 }} style="position: absolute; top:20px; left:0; font-size:10px; z-index:1110;
                                             text-align: center; 
                                             display: flex;
                                             justify-content: center; 
                                             align-items: center;
                                             width: 100%; /* Ensures text spans full width */
                                             color: #ffffff; /* Modify for visibility */
                                             margin-top: 0; /* Optional spacing */
                                             padding: 0; /* Optional padding for responsiveness */">Enter the amount to generate a QR code for the client to scan, or share the address for them to initiate a transaction.</p>

                                  <button 
                                    on:click={copyFullAddress(user_address)}
                                    on:keydown={(event) => {
                                      if (event.key === 'Enter' || event.key === ' ') { 
                                        copyFullAddress(user_address);
                                      }
                                    }}
                                    style="
                                      position: absolute;
                                      background: transparent; 
                                      height: 56px; /* 修正高度為正常按鈕尺寸 */
                                      width: 70vw;
                                      max-width: 300px;
                                      top: 120px;
                                      left: 50%;
                                      transform: translate(-50%, -50%);
                                      display: flex; 
                                      justify-content: center; 
                                      z-index: 1200;
                                      align-items: center; 
                                      border: 4px dotted; 
                                      margin: 0; 
                                      padding: 0;
                                      cursor: pointer;" 
                                    aria-label="Copy EVM Wallet Address"
                                  >
                                    <span 
                                      style="display: flex; 
                                             font-weight: 700; 
                                             color: white; 
                                             font-size: 14px; 
                                             margin: 12px; 
                                             filter: drop-shadow(0 0 32px rgba(255, 255, 255, 1));">
                                      <Copy/> <span style="margin-top:6px;">{tempMessage ? tempMessage : user_address.slice(0, 8) + "..." + user_address.slice(-8) }</span>
                                    </span>
                                  </button>
                              {/if}
                              <div in:blur={{ duration: 600 }} 
                                style="background:transparent; position: absolute; height:240px; width:240px;z-index:120;
                                       margin-top:-16px; left:50%; transform: translateX(-50%); display: flex; align-items: center; justify-content: center;">
                                {@html qrSvg}
                              </div>

                            {:else if operation === "SEND"}
                              <button in:blur={{ duration: 600 }} 
                                on:click={toggleCamera}
                                style="background: transparent; position: fixed; height:32px; width:240px;
                                       margin-top:80px; left:50%; transform: translateX(-50%);
                                       display: flex; align-items: center; justify-content: center;
                                       border: none; color: {op_color}; font-size: 14px; font-weight:700;">
                                {scanning ? "Stop Scanning" : "Click here to scan QR code"}
                              </button>

                              <div 
                                  in:blur={{ duration: 600 }} 
                                style="transition: background 0.3s ease-in-out, color 0.3s ease-in-out, border 0.6s ease-in-out;
                                       position:absolute; background:transparent; min-width:240px;
                                       top:0px; height:220px; width:80vw; margin-left:0vw; border-radius: 16px;">

                                {#if scanning}
                                  <video in:blur={{ duration: 600 }} 
                                    bind:this={videoElement}
                                    autoplay 
                                    playsinline 
                                    style="position: absolute; width: 100%; height: 100%; object-fit: cover; border-radius: 16px; opacity:0.68; margin-top:-16px;">
                                  </video>
                                {/if}
                              </div>
                            {/if}
                          </div>
                        {/if}

  {:else if operation === "CLAIM"}
    
                    <p style="filter: drop-shadow(0 0 4px #00000088);position:absolute; left:50%; transform: translateX(-50%); bottom:8px; font-size: 12px;width:100%;" > Claimable Allocation : {formatVolume(coin_BUY * eth_price * claimable,1)} USD</p>
                    <p class="gold-text" style="filter: drop-shadow(0 0 4px #00000088);position:absolute; left:50%; transform: translateX(-50%); top:16px; font-size: 20px;width:100%;" > <span> Prize Pool :</span> {formatVolume(claimable,1)} {coin_name}</p>
                    
                    <p key={amount} style="filter: drop-shadow(0 0 4px #00000088);
                        position:absolute; 
                        left:50%; width:80vw; top:92px; 
                        transform: translateX(-50%); 
                        font-size: 12px; 
                        color:{op_color};">
                        {@html claim_display}
                    </p>
            

                    <div class="progress-container" style="border-top: 1px solid {op_color}; border-bottom: 2px solid {op_color}88;">
                    <div class="progress-label" id="progressLabel">{progress}%</div>
                        <div
                        class="warning-tape"
                        id="warningTape"
                        style="width: {progress}%"
                        ></div>
                    </div>
    
                     <p style="position:absolute; left:50%; width:80vw; top:168px; transform: translateX(-50%); font-size: 12px; color:{op_color};">
                     {formatVolume(circulatingsupply,2)} of {formatVolume(totalsupply,2)} ({formatVolume(circulatingsupply*100/totalsupply,2)}%) ${coin_name} minted.</p>
{/if}

            {#if operation === "SELL" && circulatingsupply / totalsupply < 0.99}

                <div class="progress-container" style="border-top: 1px solid {op_color}; border-bottom: 2px solid {op_color}88;">
                <div class="progress-label" id="progressLabel">{progress}%</div>
                    <div
                    class="warning-tape"
                    id="warningTape"
                    style="width: {progress}%"
                    ></div>
                </div>
                {#if circulatingsupply / totalsupply < 0.99}
                        <p class="gold-text" style="position:absolute; left:50%; width:80vw; top:168px; transform: translateX(-50%); font-size: 12px; color:{op_color};">
                            Available after circulation exceeds 99% </p>
                {:else}
                         <p style="position:absolute; left:50%; width:80vw; top:260px; transform: translateX(-50%); font-size: 12px; color:{op_color};">
                         {formatVolume(circulatingsupply,2)} of {formatVolume(totalsupply,2)} ({formatVolume(circulatingsupply*100/totalsupply,2)}%) ${coin_name} minted.</p>
                {/if}

            {:else if operation === "SEND"}

                    <input in:blur={{ duration: 600 }}
                        type="text"
                        bind:value={target_address}
                        placeholder={address_placeholder}
                        {disabled}
                          style="
                            position: absolute;
                            background: transparent; 
                            height: 48px; /* 修正高度為正常按鈕尺寸 */
                            width: 68vw;
                            font-size: 16px; /* 字体大小 */
                            font-weight: 700;
                            text-align: center; /* 文本水平居中 */
                            max-width: 300px;
                            top: 260px;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            display: flex; 
                            justify-content: center; 
                            align-items: center; 
                            margin:0px;
                            cursor: pointer;" 
                    />

            {/if}



            

        
        </div>

      <a href="https://basescan.org/address/{$M9ContractAddress}" target="_blank" rel="noopener noreferrer" class="{identifyBlockchainAddress($refer_address) === "EVM" && operation !== "SELL" &&  operation !== "SEND"? "rgb-text" : ""} {target_address === contract_address && operation === "CLAIM" ? "gold-text" : ""}" 
            style="text-decoration: {target_address === contract_address && operation !== "ASK" ? "underline" : "none"}; position:absolute; left:50%; width:80vw; {operation !== "ASK" ? "bottom:100px" : "top:150px"}; transform: translateX(-50%); font-size: 12px; color:{op_color};">
            {identifyBlockchainAddress($refer_address) === "EVM" && operation !== "SELL" &&  operation !== "SEND" &&  operation !== "ASK"
             ? "+ VIP Membership Bonus" : operation === "ASK"
             ? "Show QR code to clients for transaction" : target_address === contract_address 
             ? "Open Source LP Contract Code" : "" }</a>

        
        <button in:blur={{ duration: 1200 }} 
          on:click={action} 
          disabled={
              (operation === "SELL" && (circulatingsupply / totalsupply < 0.99 || !amount)) || 
              (operation === "ASK" && (amount === 0 || !amount)) || 
              (operation === "BUY" && (amount === 0 || !amount)) || 
              (operation === "SEND" && (!target_address || target_address.trim() === "" || (amount === 0 || !amount)))
          }
          class="main_button_tx pushable" 
          style="bottom:16px;border: 2px solid {op_color}; ">

          <span 
            class="front_tx {identifyBlockchainAddress($refer_address) === 'EVM' && operation !== 'SELL' && operation !== 'SEND' ? 'rgb-text' : ''}" 
            style="color: {op_color}; border-top: 2px solid white;  border-bottom: 3px solid #ffffffcc; filter: drop-shadow(0 0 4px {op_color}); ">

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
                border-radius: 28px; 
                z-index:-1;">
              <source src={Bg} type="video/mp4" />
            </video>

            {#if operation === "SELL" && circulatingsupply / totalsupply < 0.99}
              Available Soon
            {:else if operation === "ASK" && qrSvg}
              Reset QR Code
            {:else if operation === "ASK"}
              Generate Tx QR
            {:else}
              {operation} 
              {identifyBlockchainAddress($refer_address) === "EVM" && operation == "CLAIM" ? formatVolume(claimable * 0.00011,1) 
              : identifyBlockchainAddress($refer_address) === "EVM" && operation == "BUY" ? formatVolume(Output * 1.1,1) 
              : operation == "CLAIM" ? formatVolume(claimable * 0.0001,1) 
              : operation == "BUY" ? formatVolume(Output,1) 
              : formatVolume(Output,1)}
              {coin_name}
            {/if}
          </span>
        </button>
            
    </div>
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
    opacity: 0.5; /* 默认其他按钮透明度 */
    transition: all 0.1s ease; /* 添加平滑过渡效果 */
      z-index: 1006;
  }

    /* 基础容器样式 */
    .progress-container {
      position: absolute;
      width: 60vw;
      left:10vw;
      top:120px;
      height: 16px;
      background: transparent; /* 背景色，表示進度條的剩餘部分 */
      border-radius: 16px;
      overflow: hidden; /* 隱藏內容，確保進度帶不會超出 */
      margin: 20px auto;
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

    /* 標籤文本 */
    .progress-label {
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 16px;
      font-weight: bold;
      color: white;
    }


  @keyframes fadeInOut {
      0%, 100% {
          opacity: 0;
      }
      50% {
          opacity: 1;
      }
  }
  </style>