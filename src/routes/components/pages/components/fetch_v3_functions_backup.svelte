
/**
 * Fetches USDT balance from an alternative API.
 * @param {string} inputAddress - The user's TON address.
 * @returns {Promise<number>} - The USDT balance.
 */
// async function fetch_USDT_balance(inputAddress) {
//     try {
//         const usdtApiUrl = `https://toncenter.com/api/v3/jetton/wallets?owner_address=${inputAddress}&jetton_address=${$usdt_minter}&api_key=${$TON_apiKey}`;
//         const response = await fetch(usdtApiUrl);

//         if (!response.ok) {
//             throw new Error(`Failed to fetch USDT balance: ${response.statusText}`);
//         }

//         const data = await response.json();
//         if (data && data.jetton_wallets.length > 0) {
//             const balance = data.jetton_wallets[0].balance / 1e6;
//             return balance; // 返回處理後的 USDT 餘額
//         }
//         return 0; // 若無餘額，返回 0
//     } catch (error) {
//         // console.error("Error fetching fallback USDT balance:", error);
//         return 0; // 出錯時返回 0
//     }
// }
// async function fetch_DOGS_balance(inputAddress) {
//     try {
//         const usdtApiUrl = `https://toncenter.com/api/v3/jetton/wallets?owner_address=${inputAddress}&jetton_address=${$dogs_minter}&api_key=${$TON_apiKey}`;
//         const response = await fetch(usdtApiUrl);

//         if (!response.ok) {
//             throw new Error(`Failed to fetch USDT balance: ${response.statusText}`);
//         }
//         const data = await response.json();
//         if (data && data.jetton_wallets.length > 0) {
//             const balance = data.jetton_wallets[0].balance / 1e6;
//             return balance; // 返回處理後的 USDT 餘額
//         }
//         return 0; // 若無餘額，返回 0
//     } catch (error) {
//         // console.error("Error fetching fallback DOGS balance:", error);
//         return 0; // 出錯時返回 0
//     }
// }
// async function fetch_HMSTR_balance(inputAddress) {
//     try {
//         const usdtApiUrl = `https://toncenter.com/api/v3/jetton/wallets?owner_address=${inputAddress}&jetton_address=${$hmstr_minter}&api_key=${$TON_apiKey}`;
//         const response = await fetch(usdtApiUrl);

//         if (!response.ok) {
//             throw new Error(`Failed to fetch HMSTR balance: ${response.statusText}`);
//         }
//         const data = await response.json();
//         if (data && data.jetton_wallets.length > 0) {
//             const balance = data.jetton_wallets[0].balance / 1e6;
//             return balance; // 返回處理後的 USDT 餘額
//         }
//         return 0; // 若無餘額，返回 0
//     } catch (error) {
//         // console.error("Error fetching fallback HMSTR balance:", error);
//         return 0; // 出錯時返回 0
//     }
// }
