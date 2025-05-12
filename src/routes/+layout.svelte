<script>
    import './styles.css';
    import { onMount } from "svelte";
    // import { tonConnectUI, isClicked,
    //     main_address,
    //     main_raw_address} from './store.js';
    
    // 設置頁眉顏色函數
    function setHeaderColor() {
        if (window.TelegramWebviewProxy && typeof window.TelegramWebviewProxy.postEvent === 'function') {
            const headerColorData = JSON.stringify({
                color: "#000000" // 設置頁眉為金色
            });
            window.TelegramWebviewProxy.postEvent('web_app_set_header_color', headerColorData);
        } else {
            // console.warn("TelegramWebviewProxy 或 postEvent 方法不可用 (header color)");
        }
    }

    // 設置背景顏色函數
    function setBackgroundColor() {
        if (window.TelegramWebviewProxy && typeof window.TelegramWebviewProxy.postEvent === 'function') {
            const backgroundColorData = JSON.stringify({
                color: "#000000" // 設置背景為金色
            });
            window.TelegramWebviewProxy.postEvent('web_app_set_background_color', backgroundColorData);
        } else {
            // console.warn("TelegramWebviewProxy 或 postEvent 方法不可用 (background color)");
        }
    }

    // 展開應用函數
    function expandApp() {
        if (window.TelegramWebviewProxy && typeof window.TelegramWebviewProxy.postEvent === 'function') {
            window.TelegramWebviewProxy.postEvent('web_app_expand', '{}'); // 調用展開方法
        } else {
            // console.warn("TelegramWebviewProxy 或 postEvent 方法不可用 (expand app)");
        }
    }

    // 震動回饋的函數
    function triggerHapticFeedback() {
        if (window.TelegramWebviewProxy && typeof window.TelegramWebviewProxy.postEvent === 'function') {
            const hapticFeedbackData = JSON.stringify({
                type: 'impact',
                impact_style: 'medium', // 調整震動強度，可為 'light', 'medium', 'heavy'
            });
            window.TelegramWebviewProxy.postEvent('web_app_trigger_haptic_feedback', hapticFeedbackData);
        } else {
            // console.warn("TelegramWebviewProxy 或 postEvent 方法不可用 (haptic feedback)");
        }
    }

    // 全域點擊事件
    function handleGlobalClick() {
        triggerHapticFeedback();
        isClicked.set(true);
    }

    // 註冊與移除事件監聽器及設置顏色和展開
    onMount(() => {
        // 檢查是否符合運行條件
        // if (!window.Telegram.WebApp.initDataUnsafe.start_param) {
        //     // $tonConnectUI.disconnect().then(() => {
        //     //     console.log("Disconnected successfully.");
        //     //     main_raw_address.set(null); // 清空原始地址
        //     //     main_address.set(null); // 清空转换后的地址
        //     // }).catch((e) => {
        //     //     console.error("Disconnect failed:", e.message);
        //     // });
        //     // modalTitle = "Browser Restricted";
        //     // modalMessage = `Please use Telegram App to check status and claim airdrops.`;
        //     // showModal = true;
        //     return; // 停止後續執行
        // }
        // 設置頁眉和背景顏色
        setHeaderColor();
        setBackgroundColor();

        // 展開應用
        expandApp();

    });

</script>

<div class="app ">
    <main >
        <slot />
    </main>
</div>
