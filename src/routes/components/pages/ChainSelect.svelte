<script>
  export let options = []; // 接收選項的屬性，包含鏈名稱和圖標
  export let selected = { chain: "TON", icon: null }; // 默認選中的鏈
  let isExpanded = false; // 控制展開狀態

  function toggleMenu() {
    isExpanded = !isExpanded; // 切換展開狀態
  }

  function selectChain(chain, icon) {
    selected.chain = chain; // 更新選中的鏈名稱
    selected.icon = icon; // 更新選中的圖標
    isExpanded = false; // 收起選單
    // 可以觸發外部事件，通知選擇的結果
    dispatchEvent(new CustomEvent('change', { detail: { chain, icon } }));
  }
</script>

<style>
  #menu-container {
    position: fixed;
    bottom: -64px;
    height: 120px;
    right: 32px;
    width: 56px;
    border: 1px solid white;
    border-radius: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(#FFFF00, #FFFFFF, #FFD700, #FFD700, #FFD700);
    z-index: 2000;
    transition: width 0.3s;
    overflow: visible;
    box-shadow:
      0 0 10px rgba(255, 223, 0, 0.8),
      0 0 20px rgba(255, 223, 0, 0.6),
      0 0 30px rgba(255, 223, 0, 0.4);
  }

  #menu-options {
    display: none;
    flex-direction: row;
    position: absolute;
    background: linear-gradient(#FFFF00, #FFFFFF, #FFFF00, #FFD700);
    top: 0;
    left: 6px;
    gap: 10px;
  }

  #menu-options.expanded {
    display: flex;
  }

  #menu-options button {
    height: 56px;
    width: 56px;
    border-radius: 20px;
    background: linear-gradient(#FFFF00, #FFFFFF, #FFFF00, #FFD700);
    border: none;
    text-align: center;
    cursor: pointer;
  }

  #toggle-menu {
    height: 40px;
    width: 56px;
    border-radius: 20px;
    position: absolute;
    top: 0;
    background: none;
    border: none;
    cursor: pointer;
  }
</style>

<div id="menu-container" style="width: {isExpanded ? '200px' : '56px'};">
  <!-- 主按鈕 -->
  <button id="toggle-menu" on:click={toggleMenu}>
    <img src={selected.icon} alt={selected.chain} style="position:fixed; bottom:28px; width: 24px; height: 24px;" />
    <span style="position:fixed; bottom: 4px; font-weight: 700; font-size: 12px; color: black;">
      {selected.chain}
    </span>
  </button>

  <!-- 選單選項 -->
  <div id="menu-options" class:expanded={isExpanded}>
    {#each options as { chain, icon }}
      <button on:click={() => selectChain(chain, icon)}>
        <img src={icon} alt={chain} style="position:fixed; bottom:28px; width: 24px; height: 24px;" />
        <span style="position:fixed; bottom: 4px; font-weight: 700; font-size: 12px; color: black;">
          {chain}
        </span>
      </button>
    {/each}
  </div>
</div>