<!-- <svg
  class="animated-svg"
  width="24"
  height="10"
  viewBox="0 0 12 8"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M12 4L8.5 0.5L7.793 1.207L10.086 3.5H0V4.5H10.086L7.793 6.793L8.5 7.5L12 4Z"
    class="animated-fill"
  />
</svg> -->


<svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path class="animated-fill" d="M8.99998 7L1.99998 14L0.599976 12.6L6.19998 7L0.599976 1.4L1.99998 0L8.99998 7Z" fill="#161616"/>
</svg>


<style>
  /* 定義動畫 */
  @keyframes colorChange {
    0%, 100% {
      fill: gold;
    }
    25% {
      fill: yellow;
    }
    75% {
      fill: white;
    }
  }

  /* 應用到 SVG 元素 */
  .animated-fill {
    animation: colorChange 1s infinite;
    transition: fill 1s ease-in-out;
  }
</style>