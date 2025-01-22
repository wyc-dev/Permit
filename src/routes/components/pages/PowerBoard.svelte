<!-- PowerBoard.svelte -->
<script>
    import { onMount } from "svelte";
    import { blur } from "svelte/transition";
    import { cubicInOut } from "svelte/easing";
    import { 
            TT_Power,
            main_address,
            main_raw_address,
            telegram_x_TON,
            TON_price,
            TON_balance,
            tonConnectUI,
            usdt_balance,
            dogs_balance,
            hmstr_balance,
            redo_balance,
            usdt_minter,
            dogs_minter,
            hmstr_minter,
            redo_minter,
            usdt_worth,
            dogs_worth,
            hmstr_worth,
            redo_worth,
            refer_address,
            refer_in_DB,
            POWER_from_refer,
            POWER_of_refer_in_DB,
            assets_list,
            assets_worth_in_TON,
            latest5Tx,
            firstTx,
            TON_apiKey} from '../../store.js';
    import PocketBase from "pocketbase";
    import PowerSupply from './PowerSupply.svelte';
    import Ball from "../icons/3d_ball.png";
    import F5 from "../icons/refresh.svelte";
    import Menu from "../icons/stack.svelte";
    import Share from "../icons/share.svelte";
    import Yup from "../icons/yup.svelte";
    import Not from "../icons/not.svelte";
    import POWER from '../Power.svelte';
    import Report from './components/Report.svelte';
    import TON from "./components/ton.png";
    import ETH from "./components/eth.png";
    import SOL from "./components/sol.png";
    
    let report = true;
    let investment = 0;
    let total_TON_in_db = 0;
    let total_USDT_in_db = 0;
    let firstTxTillNow = null;
    let transactionCount = null;
    let total_POWER_in_db = null;
    let percentage = null;
    let dollar = null;
    let showButton = false;
    let check_stonfi = false;
    let check_og = false;
    let check_tonx = false;
    // let check_tmm = false;
    let check_cryptoCom = false;
    let check_binance = false;
    let check_okx = false;
    let A_score = 0;
    let B_score = 0;
    let isExpanded = false;

    // 标记数据是否已加载
    $: transactionCountLoaded = transactionCount !== null;
    $: USDT_balanceLoaded = $usdt_balance !== null;
    $: POWER_from_refer_Loaded = $POWER_from_refer !== null;
    $: percentageLoaded = total_POWER_in_db !== null && percentage !== null && !isNaN(percentage) && dollar !== null && dollar !== 0 && !isNaN(dollar);
    
    // 定义需要传递给 PowerSupply 的属性

    $: PpIconComponent = typeof investment !== 'undefined' && investment + A_score > 0 ? Yup : Not;
    $: basePointsTitle = $main_address
        ? `Projects Participation`
        : 'Explore TON for credits!';
    $: basePointsDescription = "Including investment in ⚡🌐.";
    $: A_points = (typeof investment !== 'undefined' && investment + A_score > 0)
        ? `+ ${formatVolume((investment * 10) + A_score, 2)}`
        : '--';
    // $: Base = (typeof investment !== 'undefined' && investment > 0)
    //     ? formatVolume(investment, 2)
    //     : 100;

    $: txIconComponent = transactionCount <= 0 ? Not : Yup;
    $: txTitle = 'Address activities';
    $: txDescription = address_tx_text;
    $: txRightContent = transactionCount > 0 ? `+ ${formatVolume(transactionCount + firstTxTillNow, 2)}` : '--';
    $: txBorderColor = border2_color;

    $: tonIconComponent = $TON_balance <= 0 ? Not : Yup;
    $: tonTitle = 'TON assets holdings';
    $: tonDescription = TON_balance_text;
    $: tonRightContent = $assets_worth_in_TON + $TON_balance > 0 ? `x ${formatVolume($assets_worth_in_TON + $TON_balance, 2)}` : '--';
    $: tonBorderColor = border3_color;

    $: powerIconComponent = powerRightContent == '--' ? Not : Yup;
    $: powerTitle = 'DID network AUM';
    $: powerDescription = POWER_network_text;
    $: powerRightContent = $POWER_from_refer > 0 ? `x ${formatVolume($POWER_from_refer, 2)}` : '--';
    $: powerBorderColor = border4_color;
    
    $: percentage = !$TON_balance && !total_TON_in_db && total_TON_in_db + total_USDT_in_db == 0
        ? 0
        : assets_worth_in_USD * 100 / ((total_TON_in_db * $TON_price) + total_USDT_in_db);
    $: assets_worth_in_USD = ($assets_worth_in_TON + $TON_balance) * $TON_price;
    $: dollar = (total_TON_in_db * $TON_price) + total_USDT_in_db;
    $: power_from_tg = String($telegram_x_TON).length === 0 ? 0 : 1000;

    $: power = !$POWER_from_refer && $TON_balance !== 0
        ? (firstTxTillNow + transactionCount + (investment * 10) + A_score + B_score) * ($TON_balance + $assets_worth_in_TON) + power_from_tg
        : $POWER_from_refer !== 0 && $TON_balance !== 0
        ? (firstTxTillNow + transactionCount + (investment * 10) + A_score + B_score) * ($TON_balance + $assets_worth_in_TON) * $POWER_from_refer + power_from_tg
        : $TON_balance !== 0 && transactionCount
        ? (firstTxTillNow + transactionCount + (investment * 10) + A_score + B_score) * ($TON_balance + $assets_worth_in_TON) + power_from_tg
        : firstTxTillNow + transactionCount + A_score + B_score + power_from_tg; 

    // 確保 $refer_in_DB 至少為一個空陣列
    $: content_adjust = (Array.isArray($refer_in_DB) && $refer_in_DB.length >= 4) ? "left" : "center";

    $: border1_color = A_score + investment > 0 ? "#00FF00" : "#FF0000";
    $: border2_color = transactionCount > 0 ? "#00FF00" : "#FF0000";
    $: border3_color = $TON_balance > 0 ? "#00FF00" : "#FF0000";
    $: border4_color = $POWER_from_refer > 0 ? "#00FF00" : "#FF0000";

    $: address_tx_text =
        transactionCount > 0
            ? `Made ${transactionCount} tx in ${firstTxTillNow} days on TON.`
            : "No on-chain transactions found on TON.";

    $: TON_balance_text =
        $TON_balance > 0 && $TON_balance < 1
            ? `Deposit at least 1 TON for boost.`
            : $TON_balance > 1
                ? `Holdings worth ${formatVolume($assets_worth_in_TON + $TON_balance,2)} TON.`
                : "Holding TON to multiply your POWER.";

    $: POWER_network_text =
        $POWER_from_refer < 1
            ? `Invite TON holders for boost.`
            : `${formatVolume($POWER_from_refer,2)} TON in network!`;

    const url = "https://msg.pockethost.io/";
    const pb = new PocketBase(url);
    async function authenticateUser() {
        await pb.admins.authWithPassword("address@gmail.com", "************");
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

    $: mod_address = $main_address
        ? `${$main_address.slice(0, 4)}...${$main_address.slice(-4)}`
        : "Address not found.";

    function removeDashFromString(str) {
        return str.replace(/-/g, ""); // 使用正則表達式 /-/g 來全局匹配 "-" 並替換為空字串
    }

    // 分享当前屏幕状态的功能
    async function shareStory() {
        alert("Share to story coming soon on alpha v3.");
    }

    // async function checkTg() {
    //     try {
    //         const result = await pb.collection("users").getList(1, 1, {
    //             filter: `username="${removeDashFromString($main_address)}"`,
    //         });

    //         // Check if result contains items and handle accordingly
    //         if (result.items && result.items.length > 0) {
    //             let htmlContent = result.items[0].telegram || "";
    //             let tg = htmlContent
    //                 .replace(/<\/?p>/g, "") // Remove HTML tags
    //                 .split(",")
    //                 .map((item) => item.trim()); // Trim and format

    //                 telegram_x_TON.set(tg); // Update store
    //             return tg; // Return parsed Telegram data
    //         } else {
    //                 telegram_x_TON.set("");
    //             // No matching items found
    //             return null;
    //         }
    //     } catch (error) {
    //             console.error("Error fetching Telegram data:", error);
    //             return null; // Return null on error
    //     } finally {
    //         // Optional: Add any cleanup logic here if needed
    //     }
    // }
    
    // Function to update the transaction count in the DOM
    function updateTransactionCount(count) {
        transactionCount = count;
        const transactionCountElement = document.getElementById("transactionCountDisplay");
        if (transactionCountElement) {
            transactionCountElement.textContent = `+ ${count}`;
        }
    }


    
    async function createAccount(address) {
        
        if (!$refer_address){
            return;
        } 
        
        // 如果是用戶建立地址, 則順便增加朋友
        // 如果是朋友或者其他人的地址, 這裏便留空
        let refer;
        if (address == $main_address) {
            refer = $refer_address;
        } else {
            refer = "";
        }
        
        try {
            const username = removeDashFromString(address);

            // 检查用户是否已存在
            const resultList = await pb.collection("users").getList(1, 1, {
                filter: `username="${username}" || address="${username}"`,
            });

            if (resultList.items.length > 0) {
                // 用户已存在
                // // console.log('用户名或地址已存在');
                return false;
            }

            // 屌佢老母原來唔可以響 Try 入邊用 store
            // 一定要好似上面咁 save 咗 refer 先

            // 用户不存在，继续创建
            const response = await pb.collection("users").create({
                username: username,
                address: address,
                password: address,
                passwordConfirm: address,
                refer: refer,
            });

            return true;
            
        } catch (error) {
            // console.error("创建账户失败:", error);
            return false;
        }
    }


    
    // Function to add a referral number to an existing user in the database
    async function ConnectFriend() {

        if (!$refer_address){
            return;
        } else if ($refer_address == $main_address){
            return;
        }

        const me = $main_address;
        const fd = $refer_address;

        try {
            
            const my_data = await pb.collection("users").getList(1, 1, {
                filter: `address="${removeDashFromString(me)}"`,
            });
            const fd_data = await pb.collection("users").getList(1, 1, {
                filter: `address="${removeDashFromString(fd)}"`,
            });

            if(!fd_data){
                await createAccount(fd);
            }

            // Should named outside the loop below
            // We need to use these to update DB finally 
            let my_refer_list = my_data.items[0].refer;
            let fd_refer_list = fd_data.items[0].refer;
            let include_fd = false;
            let include_me = false;

            if (fd_data.items.length > 0) {
                fd_refer_list = fd_refer_list.replace(/<\/?p>/g, "");
                if (
                    !fd_refer_list &&
                    !fd_refer_list.includes(String(me))
                ) {
                    fd_refer_list = String(me); // Start with the new number if no content exists
                } else if (!fd_refer_list.includes(String(me))) {
                    fd_refer_list += "," + String(me);
                } else if (fd_refer_list.includes(String(me))){
                    include_me = true;
                }
            }

            if (my_data.items.length > 0) {
                my_refer_list = my_refer_list.replace(/<\/?p>/g, "");
                if (
                    !my_refer_list &&
                    !my_refer_list.includes(String(fd))
                ) {
                    my_refer_list = String(fd); // Start with the new number if no content exists
                } else if (!my_refer_list.includes(String(fd))) {
                    my_refer_list += "," + String(fd);
                } else if (fd_refer_list.includes(String(me))){
                    include_fd = true;
                }
            }

            if (!include_me || !include_fd){
                await Promise.all([
                    pb.collection("users").update(my_data.items[0].id, {
                        refer: my_refer_list,
                    }),
                    pb.collection("users").update(fd_data.items[0].id, {
                        refer: fd_refer_list,
                    }),
                ]);
                alert("Connected with friend 🤝");
            } 

            return;

        } catch (error) {
            // // console.error('Error accessing DB:', error);
            return;
        }
    }


    
    // Function to add a referral number to an existing user in the database
    async function setNewInfoInDb() {
        try {
            const result = await pb.collection("users").getList(1, 1, {
                filter: `username="${removeDashFromString($main_address)}"`,
            });
            // // console.log("Updating ... ");
            if (result.items && result.items.length > 0) {
                
                let aum;
                
                if ($POWER_from_refer){
                     aum = POWER_from_refer + $TON_balance;
                } else if ($TON_balance){
                     aum = $TON_balance;
                }
                // Save the updated referral string back to the database using the correct update method
                await pb.collection("users").update(result.items[0].id, {
                    POWER: power,
                    AUM: aum,
                    USDT: $usdt_balance,

                });
                
                // // console.log('POWER updated successfully');
            } else {
                    return;
            }
            
        } catch (error) {
            // // console.error("Error accessing DB:", error);
            return;
        }
    }


    
    // 修改 checkAddressInDb 函數
    async function checkAddressInDb(address) {
        try {
            const result = await pb.collection("users").getList(1, 1, {
                filter: `username="${removeDashFromString(address)}"`,
                // requestKey: null // 禁用自動取消
            });

            if (result.items && result.items.length > 0) {
                
                    let htmlContent = result.items[0].refer || "";
                    // let base = result.items[0].BASE || 100;
                    let tgContent = result.items[0].telegram || "";
                    
                    let tg = tgContent
                        .replace(/<\/?p>/g, "") // Remove HTML tags
                        .split(",")
                        .map((item) => item.trim()); // Trim and format
                    
                    telegram_x_TON.set(tg); // Update store
                    
                    let referList = htmlContent
                        .replace(/<\/?p>/g, "")
                        .split(",")
                        .map((item) => item.trim());

                    if ($main_address == address) {
                        refer_in_DB.set(referList);
                        await calculateTotalPower();
                        return;
                    }
            } else {
                
                    // await createAccount(removeDashFromString(address));
                    return 0;
                
            }
            
        } catch (error) {
            
                    return 0;
    
        }
    }



    async function calculateTotalPower() {
        try {
            // 以降序排序，並獲取所有用戶記錄
            const records = await pb.collection('users').getFullList({
                sort: '-POWER, -AUM' // 有 AUM 即是有 TON, 有 TON 才算 USDT
            });
            
            let totalPower = 0;
            // 遍歷記錄並累計POWER
            for (const record of records) {
                if (record.POWER === 0 && record.AUM === 0) {
                    return totalPower;
                }
                total_POWER_in_db += record.POWER;
                total_TON_in_db += record.AUM;
                total_USDT_in_db += record.USDT;
            }

            TT_Power.set(power);
            return totalPower;
            
        } catch (error) {
            // // console.error('Failed to fetch or calculate total POWER:', error);
            return 0; // 在出錯情況下返回0
        }
    }

    

    async function updateNetworkPower() {

        if ($refer_in_DB.length == 0){
            return;
        }
        
            // 重設 store 的值
            POWER_from_refer.set(0);
            POWER_of_refer_in_DB.set([]);

            const balances = await fetch_total_TON_balance($refer_in_DB);

            if (balances && balances.length > 0) {
                let newBalances = [];
                let totalReferPower = 0;
                // 累加每個餘額
                balances.forEach(balance => {
                    newBalances.push(balance);
                    totalReferPower += balance;
                });
    
                // 更新 store 的值
                POWER_of_refer_in_DB.set(newBalances);
                POWER_from_refer.set(totalReferPower);
                
            } else {
                // console.error("Failed to fetch balances for refer addresses.");
            }
    
            // 更新資料庫
            await setNewInfoInDb();
    }



    function calculateDaysSince(timestamp) {
        // 確保 timestamp 是數字格式
        if (typeof timestamp !== 'number') {
            timestamp = Number(timestamp);
        }
        // 確認 timestamp 是否為有效的數字
        if (isNaN(timestamp)) {
            // console.error("提供的 timestamp 無效:", timestamp);
            return NaN;
        }
        const currentDate = new Date();
        const firstTransferDate = new Date(timestamp * 1000); // 將秒轉換為毫秒的日期格式
        const timeDifference = currentDate - firstTransferDate; // 計算當前時間與交易時間的差距
        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // 將差距轉換為天數
        return daysDifference;
    }



    async function fetch_invested_amount() {
        const url = `https://toncenter.com/api/v3/messages?source=${$main_address}&destination=UQALUY7lNkc10kypNpKEA5GwfPLepBgGLc1LBJmbAF15VGea&api_key=${$TON_apiKey}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            // 累加所有 "value" 欄位的數值，並轉換為 TON 單位
            investment = data.messages.reduce((total, message) => {
                return total + parseFloat(message.value) / 1e9; // 將 nanoTON (1e9) 轉換為 TON
            }, 0);
            // 顯示更新的數值在 UI 上
            // // console.log(`累積的 investment (TON): ${investment}`);
        } catch (error) {
            // // console.error("取得交易資料失敗:", error);
        }
    }



    async function fetch_total_TON_balance(address_list) {
        const apiUrl = `https://tonapi.io/v2/accounts/_bulk?currency=usd&api_key=${$TON_apiKey}`;
        // 過濾掉無效地址（例如：null 或 undefined）
        const validAddresses = address_list.filter((address, index) => {
            const isValid = address && address !== "null";
            if (!isValid) {
                // 如果無效，移除對應的 $refer_in_DB 和 $Power_of_refer_in_DB 數值
                $refer_in_DB.splice(index, 1);
                $POWER_of_refer_in_DB.splice(index, 1);
            }
            return isValid;
        });
        const requestBody = {
            account_ids: validAddresses, // 使用過濾後的地址
        };
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to fetch balances. Status: ${response.status}, Error: ${errorData.error}`);
            }
            const data = await response.json();
            if (data.accounts && Array.isArray(data.accounts)) {
                const balances = data.accounts.map(account => {
                    const balance = account.balance / 1e9; // 将纳克转换为 TON
                    return balance;
                });
                return balances;
            } else {
                return [];
            }
        } catch (error) {
            // console.error('Error fetching total TON balance:', error);
            return null;
        }
    }



    async function fetch_TON_price() {
        return fetch(`https://tonapi.io/v2/rates?tokens=ton&currencies=usd&api_key=${$TON_apiKey}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.rates && data.rates.TON && data.rates.TON.prices.USD) {
                    TON_price.set(data.rates.TON.prices.USD);  // 存储TON对美元的价格
                    return $TON_price;
                }
                return "Price not found"; // 如果数据中没有价格信息
            })
            .catch(error => {
                // // console.error("Error fetching TON price:", error);
                return "Error fetching price";
            });
    }



    /**
     * Fetches and processes token data for the given user address.
     * @param {string} user_address - The user's TON address.
     */
    async function fetch_JETTON_assets(user_address) {
        
        try {
            // 構建 API URL
            const apiUrl = `https://tonapi.io/v2/accounts/${user_address}/jettons?currencies=ton,usd,rub&api_key=${$TON_apiKey}`;

            // 發送請求並獲取回應
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }

            const data = await response.json();
            // console.log(data);

            // 確保數據結構正確
            if (!data || !Array.isArray(data.balances)) {
                throw new Error("Invalid data structure received");
            }

            // 初始化 USDT、DOGS 和 HMSTR 的結餘與 TON 累計價值
            let usdtSum = 0;
            let dogsSum = 0;
            let hmstrSum = 0;
            let redoSum = 0;
            let assets_worth_TON = 0;

            // 解析並處理資料
            const processedData = data.balances.map((item) => {
                const address = item.jetton?.address || "Unknown Token";
                const decimals = item.jetton?.decimals || 0;
                const rawBalance = parseFloat(item.balance); // 原始餘額
                const balance = rawBalance / Math.pow(10, decimals); // 換算後的餘額

                // 提取價格
                const TONPrice = parseFloat(item.price?.prices?.TON || 0);
                const USDPrice = parseFloat(item.price?.prices?.USD || 0);
                const RUBPrice = parseFloat(item.price?.prices?.RUB || 0);

                // 計算價值
                const TONValue = balance * TONPrice;
                const USDValue = balance * USDPrice;
                const RUBValue = balance * RUBPrice;

                // 比對合約地址，更新對應結餘
                if (address === $usdt_minter) {
                    usdtSum += balance;
                    assets_worth_TON += TONValue;
                    usdt_worth.set(TONValue);
                } else if (address === $dogs_minter) {
                    dogsSum += balance;
                    assets_worth_TON += TONValue;
                    dogs_worth.set(TONValue);
                } else if (address === $hmstr_minter) {
                    hmstrSum += balance;
                    assets_worth_TON += TONValue;
                    hmstr_worth.set(TONValue);
                } else if (address === $redo_minter) {
                    redoSum += balance;
                    assets_worth_TON += TONValue;
                    redo_worth.set(TONValue);
                }

                return {
                    master: address,
                    balance: balance,
                    TON_value: TONValue,
                    USD_value: USDValue,
                    RUB_value: RUBValue,
                };
            });

            // 更新 Svelte stores
            assets_list.set(processedData);
            usdt_balance.set(usdtSum);
            dogs_balance.set(dogsSum);
            hmstr_balance.set(hmstrSum);
            redo_balance.set(hmstrSum);

            // 更新累計 TON 價值
            assets_worth_in_TON.set(assets_worth_TON);

        } catch (error) {
            
            console.error("Error fetching jetton assets:", error);

        }
    }
    
    async function fetch_TON_balance() {
        try {
            const response = await fetch(
                `https://toncenter.com/api/v2/getWalletInformation?address=${$main_address}&api_key=${$TON_apiKey}`
            );
            const data = await response.json();
            if (data.ok) {
                if (data.result.account_state === "uninitialized" || !data.result.account_state) {
                    TON_balance.set(0); // 沒有初始化的帳戶，設置 TON_balance 為 0
                    $tonConnectUI.disconnect().then(() => {
                        alert("Hold at least 0.01 TON to initialize the account. \n Network disconnected.");
                        return;
                        //console.log("Disconnected successfully.");
                    }).catch((e) => {
                        return;
                        // console.error("Disconnect failed:", e.message);
                    });
                } else {
                    TON_balance.set(data.result.balance / 1e9); // 轉換為 TON 單位
                }
            } else {
                TON_balance.set(0); // 如果 API 返回的結果不是 "ok"，設置為 0
            }
        } catch (error) {
            // // console.error("Error fetching TON balance:", error);
            TON_balance.set(0); // 捕獲錯誤，設置為 0
        }
    }

    

    // 查詢並檢查 On-chain transactions 的函數
    async function fetch_Tx_count(inputAddress) {
        // 初始化數據
        B_score = 0;

        try {
            // Step 1: Call the address parse API
            const parseUrl = `https://tonapi.io/v2/address/${encodeURIComponent(inputAddress)}/parse`;
            const parseResponse = await fetch(parseUrl);

            // Check if parseResponse is okay
            if (!parseResponse.ok) {
                throw new Error(
                    `Failed to fetch address parse. Status: ${parseResponse.status}`,
                );
            }

            const parseData = await parseResponse.json();

            // Ensure we get the raw_form from the response
            if (!parseData || !parseData.raw_form) {
                throw new Error(
                    "Failed to parse the address. Response data was malformed.",
                );
            }

            const rawAddress = parseData.raw_form;
            main_raw_address.set(parseData.raw_form)

            // Step 2: Call the transaction API using the raw address
            const txUrl = `https://tonapi.io/v2/blockchain/accounts/${encodeURIComponent(
                rawAddress,
            )}/transactions?limit=1000&sort_order=desc&api_key=${$TON_apiKey}`;
            const txResponse = await fetch(txUrl);

            // Check if txResponse is okay
            if (!txResponse.ok) {
                throw new Error(
                    `Failed to fetch transactions. Status: ${txResponse.status}`,
                );
            }

            const txData = await txResponse.json();

            // console.log(txData);

            // Check if the transactions array is present
            if (txData && Array.isArray(txData.transactions)) {
                // Update transaction count
                const transactionCount = txData.transactions.length;
                updateTransactionCount(transactionCount);
                
                // Step 3: Process transactions
                const transactions = txData.transactions;

                // console.log(transactions);

                const latest5Txx = transactions.slice(0, 5).map((tx) => {
                    // 獲取交易手續費
                    const fee = parseFloat(tx.fee || 0) / 1e9;
                    // 獲取交易金額
                    const inValue = parseFloat(tx.in_msg?.value || 0) / 1e9; // 接收金額
                    const outValue = parseFloat(tx.out_msgs?.[0]?.value || 0) / 1e9; // 發送金額
                    let direction, amount;
                    if (inValue > 0) {
                        // 如果有接收金額
                        direction = "Received";
                        amount = inValue.toFixed(4);
                    } else if (outValue > 0) {
                        // 如果有發送金額
                        direction = "Sent";
                        amount = outValue.toFixed(4);
                    } else {
                        // 如果沒有明確的金額，設為未知
                        direction = "Unknown";
                        amount = "0.0000";
                    }
                    // 獲取交易後的餘額
                    const endBalance = parseFloat(tx.end_balance || 0) / 1e9;
                    // 格式化日期
                    const date = new Date(tx.utime * 1000).toLocaleString("en-GB", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                    });
                    return {
                        date,
                        direction,
                        amount,
                        fee: fee.toFixed(6),
                        endBalance: endBalance.toFixed(4),
                        hash: tx.hash,
                        token: tx.out_msgs?.[0]?.jetton_info?.name || "TON",
                    };
                });

                // 設置到 store
                latest5Tx.set(latest5Txx);

                // 處理最早的一筆交易
                const oldestTx = transactions[transactions.length - 1];
                if (oldestTx) {
                    const isSend = oldestTx.in_msg?.destination?.address !== rawAddress;

                    const amount = isSend
                        ? (oldestTx.out_msgs?.[0]?.value || 0) / 1e9
                        : (oldestTx.in_msg?.value || 0) / 1e9;

                    const firstTransaction = {
                        utime: oldestTx.utime,
                        type: isSend ? "Sent" : "Received",
                        hash: oldestTx.hash,
                        token: oldestTx.out_msgs?.[0]?.jetton_info?.name || "TON",
                        amount: amount.toFixed(2),
                    };

                    const firstTransferTimestamp = oldestTx.utime;
                    firstTxTillNow = calculateDaysSince(firstTransferTimestamp);

                    firstTx.set(firstTransaction); // 設置到 store
                }

                // 分析數據更新 B_score
                for (const transaction of transactions) {
                    if (transaction.out_msgs && Array.isArray(transaction.out_msgs)) {
                        for (const msg of transaction.out_msgs) {
                            const destination = msg.destination || {};
                            const source = msg.source || {};
                            if (destination.is_scam === false && source.is_scam === false) {
                                if ((destination.name && destination.name.includes("Crypto.com")) ||
                                    (source.name && source.name.includes("Crypto.com"))) {
                                    check_cryptoCom = true;
                                } else if ((destination.name && destination.name.includes("Binance")) ||
                                    (source.name && source.name.includes("Binance"))) {
                                    check_binance = true;
                                } else if ((destination.name && destination.name.includes("OKX")) ||
                                    (source.name && source.name.includes("OKX"))) {
                                    check_okx = true;
                                }
                            }
                        }
                    }
                }

                if (check_cryptoCom) B_score += 10;
                if (check_binance) B_score += 10;
                if (check_okx) B_score += 10;
                
                return {
                    transactionCount,
                    latest5Tx,
                    firstTx,
                };
            } else {
                // console.error("Transaction data structure is unexpected:", txData);
                throw new Error("Failed to retrieve transactions. Response data was incomplete or malformed.");
            }
        } catch (error) {

            // console.error("Error fetching transaction count:", error.message || error);
            return null; // Return null or handle the error as needed
        }
    }


    
    // 查詢並檢查 NFT 的函數
    async function checkNFTs(accountAddress) {
        // 先清空 A_score
        A_score = 0;
        try {
            const response = await fetch(`https://tonapi.io/v2/accounts/${accountAddress}/nfts?limit=1000&offset=0&indirect_ownership=false&api_key=${$TON_apiKey}`);
            const data = await response.json();

            if (!data.nft_items || !Array.isArray(data.nft_items)) {
                // console.error("Invalid NFT data");
                return;
            }
            // 遍歷所有的 NFT 項目
            data.nft_items.forEach(nft => {
                // 檢查 check_og 條件
                if (nft.collection && nft.collection.address === "0:f6eb890eb9055611b72013bca8e3aff0897983e79fbd1bb59aff1e3ab03c6519" && nft.trust !== "blacklist") {
                    check_og = true;
                }
                // 檢查 check_tonx 條件
                if (nft.collection && nft.collection.address === "0:1ce2372986701e2d0ff0992edee25796821172b1123f54a5024748e18950d7f6" && nft.trust !== "blacklist") {
                    check_tonx = true;
                }
                // 檢查 check_tmm 條件
                // if (nft.collection && nft.collection.address === "0:25571cfefc76511a513bf3a77727447d284113a21de04767de9eb6ea3e834494" && nft.trust !== "blacklist") {
                //     check_tmm = true;
                // }
                // 檢查 check_stonfi 條件
                if (nft.collection && nft.collection.name && nft.collection.name.includes("Farm NFT collection") && nft.trust !== "blacklist") {
                    check_stonfi = true;
                }
            });
            // 根據條件更新 A_score
            if (check_og) A_score += 10;
            if (check_tonx) A_score += 10;
            if (check_stonfi) A_score += 10;
            // 輸出分數
            // console.log(`A_score: ${A_score}`);
        } catch (error) {
            // console.error("Error fetching or processing NFT data:", error);
        }
    }





    

    
    onMount(async () => {
        
        report = true;
        setTimeout(() => {
            showButton = true;
        }, 300);

        try {

            await Promise.all([
                authenticateUser(),
                createAccount($main_address),
                ConnectFriend(),
                fetch_TON_balance(),
            ]);

            await Promise.all([
                fetch_TON_price(),
                fetch_Tx_count($main_address),
                checkAddressInDb($main_address),
                fetch_JETTON_assets($main_address),
                fetch_invested_amount(),
                checkNFTs($main_address),
            ]);
           
            if ($refer_in_DB){ 
                await updateNetworkPower();
            }
            
        } catch (error) {

        }
        
    });
</script>






{#if report == true}

        {#if showButton}
            
                <!-- Menu -->
                <button in:blur={{ duration: 300, easing: cubicInOut }} class="gold-border" 
                    on:click={()=>{report=false;}}
                    style="position:fixed; width:56px; height:56px; border-radius:56px; top:40px; left:32px; z-index: 1001;">
                    <Menu />
                </button>
                <img src={Ball} alt="Ball" style="position:fixed; width:56px; height:56px; border-radius:56px; top:45px; left:32px; z-index: 1000;" />
                <p style="color:#888888; font-size: 14px; position:fixed; width:56px; height:56px; border-radius:56px; top:100px; left:32px; z-index: 1000;">
                    Menu</p>
                
                <!-- Reload -->
                <button in:blur={{ duration: 300, easing: cubicInOut }} class="gold-border" 
                    on:click={() => window.location.reload()}
                    style="position:fixed; width:56px; height:56px; border-radius:56px; top:140px; left:32px; z-index: 1001;">
                    <F5 />
                </button>
                <img src={Ball} alt="Ball" style="position:fixed; width:56px; height:56px; border-radius:56px; top:145px; left:32px; z-index: 1000;" />
                <p style="color:#888888; font-size: 14px; position:fixed; width:56px; height:56px; border-radius:56px; top:200px; left:32px; z-index: 1000;">
                    Reload</p>
    
                <!-- Share -->
                <button in:blur={{ duration: 300, easing: cubicInOut }} class="gold-border" 
                    on:click={() => {shareStory();}}
                    style="position:fixed; width:56px; height:56px; border-radius:56px; top:140px; right:32px; z-index: 1001;">
                    <Share />
                </button>
                <img src={Ball} alt="Ball" style="position:fixed; width:56px; height:56px; border-radius:56px; top:145px; right:32px; z-index: 1000;" />
                <p style="color:#888888; font-size: 14px; position:fixed; width:56px; height:56px; border-radius:56px; top:200px; right:32px; z-index: 1000;">
                    Share</p>
                
                <!-- Log Out -->
                <p style="color:#888888; font-size: 14px; position:fixed; width:56px; height:56px; border-radius:56px; top:100px; right:32px; z-index: 1000;">
                    Log Out</p>
            
        {/if}
    
        <Report
            {mod_address}
            {firstTxTillNow}
            {transactionCountLoaded}
            {transactionCount}
            TON_balance={$TON_balance}
            {USDT_balanceLoaded}
            {POWER_from_refer_Loaded}
            {power}
            {percentageLoaded}
            {total_POWER_in_db}
            {investment}
            {percentage}
            {dollar}
        />
        <div on:click={()=>{report=false;}} style="position:absolute; width:100%; left:0; height: auto;
                    bottom:0; top:140px; z-index:1006;"></div>
        <button
            class="main_button pushable" style="top:580px;z-index:1111;"
            on:click={()=>{report=false;}} id="report">
            <span class="front">Continue</span>
        </button>
    
{:else}

        <div class="gradient-div-top"></div>
        <div class="gradient-div-up"></div>

        <div transition:blur={{ duration: 300, easing: cubicInOut }} style="height:56px;width:56px;top:44px;position: fixed;opacity:1;z-index:303">
            <POWER outer={-1}/>

            <p style="top:-4px; color: black; z-index:1200;
                    position:fixed; margin-left:16px; line-height:20px; display: flex;flex-direction: column; text-align: left; justify-content: center; font-size: 12px; font-weight: 700;">
                Over {formatVolume(total_POWER_in_db, 2)} POWER generated by network.
            </p>
        </div>
    
        
        <div on:click={()=>{report=true;}}
            in:blur={{ duration: 300, easing: cubicInOut }}
            style="position:fixed; width:calc(100vw - 32px); min-width:320px;
                top:44px; height:56px; margin:auto; border-radius: 28px;background: transparent;cursor:pointer;"
        >
            <p
                style="position:absolute; color:gold; margin-left:68px; line-height:20px; display: flex; align-items: center; font-size: 16px; font-weight: 700;         animation: colorChange 1s infinite;
                       transition: color 1s ease-in-out;"
            >
                POWER ⚡ {formatVolume(power, 2)} 
                <!-- <span style="color:#00FF00; margin-left: 10px;font-size: 12px;"> = (A + B) x C x D</span> -->
            </p>
            <p
                style="position:absolute; top:24px;  color:#cccccc; margin-left:68px; line-height:20px; display: flex;flex-direction: column; text-align: left; justify-content: center; font-size: 14px; font-weight: 500;"
            >
                Address : {mod_address}
            </p>
        </div>
        
        <p class="sub-text" style="margin-top:8px;">
            Boost POWER factors, maximize airdrops.
        </p>

        <p class="formula">
            POWER = ( <span style="font-size: 14px;color:{border1_color};">A</span> +  
            <span style="font-size: 14px;color:{border2_color};">B</span> )  
            <span style="font-size: 14px;color:{border3_color};">x C</span>  
            <span style="font-size: 14px;color:{border4_color};">x D</span>
        </p>
        
        <!-- 使用 PowerSupply 组件 -->
        <div class="info-cards">
            <PowerSupply
                Investment={investment}
                {$main_address}
                {check_og}
                {check_tonx}
                {check_stonfi}
                {A_score}
                invest={formatVolume(investment * 10, 2)}
                iconComponent={PpIconComponent}
                title={basePointsTitle}
                description={basePointsDescription}
                rightContent={A_points}
                borderColor={border1_color}
                order={"A"}
            />
        
            <PowerSupply
                Investment={investment}
                {$main_address}
                {check_cryptoCom}
                {check_binance}
                {check_okx}
                {B_score}
                {firstTxTillNow}
                {transactionCount}
                iconComponent={txIconComponent}
                title={txTitle}
                description={txDescription}
                rightContent={txRightContent}
                borderColor={txBorderColor}
                order={"B"}
            />
        
            <PowerSupply
                {$main_address}
                iconComponent={tonIconComponent}
                title={tonTitle}
                description={tonDescription}
                rightContent={tonRightContent}
                borderColor={tonBorderColor}
                order={"C"}
            />
        
            <PowerSupply
                {content_adjust}
                iconComponent={powerIconComponent}
                title={powerTitle}
                description={powerDescription}
                rightContent={powerRightContent}
                borderColor={powerBorderColor}
                order={"D"}
            />

        </div>
    

{/if}
