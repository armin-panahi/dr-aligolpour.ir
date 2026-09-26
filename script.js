const canvas = document.getElementById("ambientCanvas");
const ctx = canvas.getContext("2d");
let particles = [], w, h, dpr;

function resizeCanvas(){
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = window.innerWidth; h = window.innerHeight;
  canvas.width = w*dpr; canvas.height = h*dpr;
  canvas.style.width = w+"px"; canvas.style.height = h+"px";
  ctx.setTransform(dpr,0,0,dpr,0,0);
  particles = Array.from({length: Math.min(65, Math.floor(w/20))}, () => ({
    x: Math.random()*w, y: Math.random()*h,
    r: Math.random()*1.7+.25, vx:(Math.random()-.5)*.12, vy:(Math.random()-.5)*.10,
    a:Math.random()*.5+.12
  }));
}
function draw(){
  ctx.clearRect(0,0,w,h);
  const t = Date.now()*.0002;
  particles.forEach((p,i)=>{
    p.x += p.vx + Math.sin(t+i)*.025; p.y += p.vy + Math.cos(t+i)*.018;
    if(p.x<-10)p.x=w+10;if(p.x>w+10)p.x=-10;if(p.y<-10)p.y=h+10;if(p.y>h+10)p.y=-10;
    ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(238,229,213,${p.a})`;ctx.fill();
  });
  const grad=ctx.createRadialGradient(w*.72,h*.18,0,w*.72,h*.18,Math.min(w,h)*.42);
  grad.addColorStop(0,"rgba(190,160,120,.045)");grad.addColorStop(1,"rgba(190,160,120,0)");
  ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
  requestAnimationFrame(draw);
}
window.addEventListener("resize",resizeCanvas); resizeCanvas(); draw();

const observer = new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("is-visible")});
},{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));

const toggle=document.querySelector(".menu-toggle");
const nav=document.querySelector(".nav");
toggle.addEventListener("click",()=>{
  const open=nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded",open);
});
document.querySelectorAll(".nav a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));

const form = document.getElementById("bookingForm");
const message = document.getElementById("formMessage");

if (form && message) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // بررسی اعتبار فرم
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // گرفتن آدرس Formspree از action فرم
    const endpoint = form.getAttribute("action");

    // دکمه ارسال
    const submitButton = form.querySelector('button[type="submit"]');

    // جلوگیری از ارسال در صورتی که Form ID هنوز وارد نشده
    if (!endpoint || endpoint.includes("REPLACE_WITH_YOUR_FORM_ID")) {
      message.textContent =
        "اتصال Formspree هنوز کامل نشده است؛ Form ID را در action فرم وارد کنید.";

      message.style.color = "#d6a86a";
      return;
    }

    // ذخیره محتوای اصلی دکمه
    const originalButtonHTML = submitButton.innerHTML;

    // حالت Loading
    submitButton.disabled = true;
    submitButton.style.opacity = "0.65";

    message.textContent = "در حال ارسال درخواست...";
    message.style.color = "";

    try {

      // ارسال اطلاعات فرم به Formspree
      const response = await fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: {
          Accept: "application/json"
        }
      });

      // تلاش برای دریافت پاسخ JSON
      const result = await response.json().catch(() => ({}));

      // اگر ارسال موفق بود
      if (response.ok) {

        message.textContent =
          "درخواست نوبت شما با موفقیت ارسال شد. کلینیک برای هماهنگی با شما تماس می‌گیرد.";

        message.style.color = "#b8d7b0";

        // خالی کردن فرم
        form.reset();

      } else {

        // دریافت اولین خطای Formspree
        const firstError =
          Array.isArray(result.errors) &&
          result.errors[0]?.message
            ? result.errors[0].message
            : "ارسال فرم انجام نشد. لطفاً دوباره تلاش کنید.";

        message.textContent = firstError;
        message.style.color = "#d99a9a";
      }

    } catch (error) {

      // خطای اتصال اینترنت یا Formspree
      message.textContent =
        "ارتباط با سرویس ارسال فرم برقرار نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.";

      message.style.color = "#d99a9a";

    } finally {

      // فعال کردن دوباره دکمه
      submitButton.disabled = false;
      submitButton.style.opacity = "";

      // برگرداندن متن اصلی دکمه
      submitButton.innerHTML = originalButtonHTML;
    }
  });
}

// =========================================================
// PREMIUM RESULTS SLIDER + LIGHTBOX
// =========================================================

(function initResultsSlider(){

  const shell =
    document.querySelector(
      "[data-results-slider]"
    );

  if(!shell) return;


  const viewport =
    shell.querySelector(
      "[data-ba-viewport]"
    );

  const track =
    shell.querySelector(
      "[data-ba-track]"
    );

  const slides =
    Array.from(
      shell.querySelectorAll(
        "[data-ba-slide]"
      )
    );


  const prevButton =
    shell.querySelector(
      ".ba-prev"
    );

  const nextButton =
    shell.querySelector(
      ".ba-next"
    );


  const pagination =
    Array.from(
      shell.querySelectorAll(
        ".ba-page-segment"
      )
    );


  const images =
    Array.from(
      shell.querySelectorAll(
        "[data-result-image]"
      )
    );


  if(
    !viewport ||
    !track ||
    !slides.length
  ){
    return;
  }


  let currentSlide = 0;

  let autoplayTimer = null;

  let touchStartX = 0;

  let touchEndX = 0;

  let isDragging = false;


  /* =======================================================
     PERSIAN DIGITS
     ======================================================= */

  function toFa(value){

    return String(value)
      .replace(
        /[0-9]/g,
        digit => "۰۱۲۳۴۵۶۷۸۹"[digit]
      );

  }


  /* =======================================================
     RENDER SLIDE
     ======================================================= */

  function renderSlide(
    index,
    animate = true
  ){

    currentSlide =
      (
        index +
        slides.length
      ) %
      slides.length;


    track.style.transition =
      animate
        ? "transform .82s cubic-bezier(.22,.61,.36,1)"
        : "none";


    track.style.transform =
      `translate3d(-${currentSlide * 100}%,0,0)`;


    slides.forEach(
      (
        slide,
        i
      ) => {

        slide.classList.toggle(
          "is-active",
          i === currentSlide
        );

        slide.setAttribute(
          "aria-hidden",
          i === currentSlide
            ? "false"
            : "true"
        );

      }
    );


    pagination.forEach(
      (
        button,
        i
      ) => {

        button.classList.toggle(
          "is-active",
          i === currentSlide
        );

        button.setAttribute(
          "aria-current",
          i === currentSlide
            ? "true"
            : "false"
        );

      }
    );

  }


  /* =======================================================
     NEXT
     ======================================================= */

  function nextSlide(){

    renderSlide(
      currentSlide + 1
    );

  }


  /* =======================================================
     PREVIOUS
     ======================================================= */

  function prevSlide(){

    renderSlide(
      currentSlide - 1
    );

  }


  /* =======================================================
     AUTOPLAY
     ======================================================= */

  function stopAutoplay(){

    clearInterval(
      autoplayTimer
    );

    autoplayTimer = null;

  }


  function startAutoplay(){

    stopAutoplay();


    if(
      document.hidden ||
      slides.length <= 1
    ){
      return;
    }


    autoplayTimer =
      setInterval(
        nextSlide,
        5600
      );

  }


  /* =======================================================
     BUTTONS
     ======================================================= */

  nextButton?.addEventListener(
    "click",
    () => {

      nextSlide();

      startAutoplay();

    }
  );


  prevButton?.addEventListener(
    "click",
    () => {

      prevSlide();

      startAutoplay();

    }
  );


  /* =======================================================
     PAGINATION
     ======================================================= */

  pagination.forEach(
    (
      button,
      index
    ) => {

      button.addEventListener(
        "click",
        () => {

          renderSlide(
            index
          );

          startAutoplay();

        }
      );

    }
  );


  /* =======================================================
     KEYBOARD
     ======================================================= */

  viewport.addEventListener(
    "keydown",
    event => {

      if(
        event.key ===
        "ArrowRight"
      ){

        event.preventDefault();

        nextSlide();

        startAutoplay();

      }


      if(
        event.key ===
        "ArrowLeft"
      ){

        event.preventDefault();

        prevSlide();

        startAutoplay();

      }


      if(
        event.key ===
        "Home"
      ){

        event.preventDefault();

        renderSlide(
          0
        );

        startAutoplay();

      }


      if(
        event.key ===
        "End"
      ){

        event.preventDefault();

        renderSlide(
          slides.length - 1
        );

        startAutoplay();

      }

    }
  );


  /* =======================================================
     MOUSE
     ======================================================= */

  viewport.addEventListener(
    "mouseenter",
    stopAutoplay
  );


  viewport.addEventListener(
    "mouseleave",
    startAutoplay
  );


  viewport.addEventListener(
    "focusin",
    stopAutoplay
  );


  viewport.addEventListener(
    "focusout",
    startAutoplay
  );


  /* =======================================================
     TOUCH SWIPE
     ======================================================= */

  viewport.addEventListener(
    "touchstart",
    event => {

      const touch =
        event.touches[0];

      touchStartX =
        touch.clientX;

      touchEndX =
        touchStartX;

      isDragging = true;

      stopAutoplay();

    },
    {
      passive:true
    }
  );


  viewport.addEventListener(
    "touchmove",
    event => {

      if(!isDragging){
        return;
      }


      touchEndX =
        event.touches[0].clientX;

    },
    {
      passive:true
    }
  );


  viewport.addEventListener(
    "touchend",
    () => {

      if(!isDragging){
        return;
      }


      const distance =
        touchEndX -
        touchStartX;


      isDragging = false;


      if(
        Math.abs(distance) >
        55
      ){

        if(distance < 0){

          nextSlide();

        }else{

          prevSlide();

        }

      }


      startAutoplay();

    },
    {
      passive:true
    }
  );


  /* =======================================================
     INIT LIGHTBOX
     ======================================================= */

  const lightbox =
    document.createElement(
      "div"
    );


  lightbox.className =
    "ba-lightbox";


  lightbox.setAttribute(
    "aria-hidden",
    "true"
  );


  lightbox.innerHTML = `

    <div
      class="ba-lightbox-stage"
      role="dialog"
      aria-modal="true"
      aria-label="نمایش بزرگ تصویر نمونه‌کار"
    >

      <div class="ba-lightbox-top">

        <span
          class="ba-lightbox-counter"
          data-lightbox-counter
        >
          ۰۱ / ۱۰
        </span>


        <button
          class="ba-lightbox-close"
          type="button"
          aria-label="بستن"
        >
          ×
        </button>

      </div>


      <button
        class="ba-lightbox-arrow ba-lightbox-prev"
        type="button"
        aria-label="تصویر قبلی"
      >
        ←
      </button>


      <img
        class="ba-lightbox-image"
        data-lightbox-image
        alt=""
      >


      <button
        class="ba-lightbox-arrow ba-lightbox-next"
        type="button"
        aria-label="تصویر بعدی"
      >
        →
      </button>


      <div class="ba-lightbox-controls">

        <button
          class="ba-lightbox-control"
          type="button"
          data-zoom-out
          aria-label="کوچک کردن"
        >
          −
        </button>


        <button
          class="ba-lightbox-control"
          type="button"
          data-zoom-reset
          aria-label="بازنشانی زوم"
        >
          100%
        </button>


        <button
          class="ba-lightbox-control"
          type="button"
          data-zoom-in
          aria-label="بزرگ کردن"
        >
          +
        </button>

      </div>

    </div>

  `;


  document.body.appendChild(
    lightbox
  );


  const lightboxImage =
    lightbox.querySelector(
      "[data-lightbox-image]"
    );


  const counter =
    lightbox.querySelector(
      "[data-lightbox-counter]"
    );


  const closeButton =
    lightbox.querySelector(
      ".ba-lightbox-close"
    );


  const lightboxPrev =
    lightbox.querySelector(
      ".ba-lightbox-prev"
    );


  const lightboxNext =
    lightbox.querySelector(
      ".ba-lightbox-next"
    );


  const zoomIn =
    lightbox.querySelector(
      "[data-zoom-in]"
    );


  const zoomOut =
    lightbox.querySelector(
      "[data-zoom-out]"
    );


  const zoomReset =
    lightbox.querySelector(
      "[data-zoom-reset]"
    );


  let currentImageIndex = 0;

  let zoomLevel = 1;


  const minZoom = 1;

  const maxZoom = 3;

  const zoomStep = .25;


  /* =======================================================
     GET IMAGE INFO
     ======================================================= */

  function getImageData(index){

    const card =
      images[index];


    const image =
      card?.querySelector(
        "img"
      );


    return {
      src:
        image?.src || "",

      alt:
        image?.alt || ""
    };

  }


  /* =======================================================
     UPDATE LIGHTBOX
     ======================================================= */

  function updateLightboxImage(
    index
  ){

    currentImageIndex =
      (
        index +
        images.length
      ) %
      images.length;


    const data =
      getImageData(
        currentImageIndex
      );


    lightboxImage.src =
      data.src;


    lightboxImage.alt =
      data.alt;


    counter.textContent =
      `${toFa(currentImageIndex + 1)} / ${toFa(images.length)}`;


    resetZoom();

  }


  /* =======================================================
     OPEN
     ======================================================= */

  function openLightbox(
    index
  ){

    stopAutoplay();


    updateLightboxImage(
      index
    );


    lightbox.classList.add(
      "is-open"
    );


    lightbox.setAttribute(
      "aria-hidden",
      "false"
    );


    document.body.style.overflow =
      "hidden";

  }


  /* =======================================================
     CLOSE
     ======================================================= */

  function closeLightbox(){

    lightbox.classList.remove(
      "is-open"
    );


    lightbox.setAttribute(
      "aria-hidden",
      "true"
    );


    document.body.style.overflow =
      "";


    startAutoplay();

  }


  /* =======================================================
     IMAGE CLICK
     ======================================================= */

  images.forEach(
    (
      card,
      index
    ) => {

      card.addEventListener(
        "click",
        () => {

          openLightbox(
            index
          );

        }
      );

    }
  );


  /* =======================================================
     LIGHTBOX NAVIGATION
     ======================================================= */

  function nextLightboxImage(){

    updateLightboxImage(
      currentImageIndex + 1
    );

  }


  function prevLightboxImage(){

    updateLightboxImage(
      currentImageIndex - 1
    );

  }


  lightboxNext.addEventListener(
    "click",
    nextLightboxImage
  );


  lightboxPrev.addEventListener(
    "click",
    prevLightboxImage
  );


  closeButton.addEventListener(
    "click",
    closeLightbox
  );


  /* =======================================================
     CLOSE ON BACKDROP
     ======================================================= */

  lightbox.addEventListener(
    "click",
    event => {

      if(
        event.target ===
        lightbox
      ){

        closeLightbox();

      }

    }
  );


  /* =======================================================
     KEYBOARD LIGHTBOX
     ======================================================= */

  document.addEventListener(
    "keydown",
    event => {

      if(
        !lightbox.classList.contains(
          "is-open"
        )
      ){
        return;
      }


      if(
        event.key ===
        "Escape"
      ){

        closeLightbox();

      }


      if(
        event.key ===
        "ArrowRight"
      ){

        event.preventDefault();

        nextLightboxImage();

      }


      if(
        event.key ===
        "ArrowLeft"
      ){

        event.preventDefault();

        prevLightboxImage();

      }


      if(
        event.key ===
        "+" ||
        event.key === "="
      ){

        zoomImage(
          zoomLevel +
          zoomStep
        );

      }


      if(
        event.key ===
        "-"
      ){

        zoomImage(
          zoomLevel -
          zoomStep
        );

      }


      if(
        event.key ===
        "0"
      ){

        resetZoom();

      }

    }
  );


  /* =======================================================
     ZOOM
     ======================================================= */

  function zoomImage(
    value
  ){

    zoomLevel =
      Math.max(
        minZoom,
        Math.min(
          maxZoom,
          value
        )
      );


    lightboxImage.style.transform =
      `scale(${zoomLevel})`;


    lightbox.classList.toggle(
      "is-zoomed",
      zoomLevel > 1
    );

  }


  function resetZoom(){

    zoomLevel = 1;

    lightboxImage.style.transform =
      "scale(1)";


    lightbox.classList.remove(
      "is-zoomed"
    );

  }


  zoomIn.addEventListener(
    "click",
    () => {

      zoomImage(
        zoomLevel +
        zoomStep
      );

    }
  );


  zoomOut.addEventListener(
    "click",
    () => {

      zoomImage(
        zoomLevel -
        zoomStep
      );

    }
  );


  zoomReset.addEventListener(
    "click",
    resetZoom
  );


  /* =======================================================
     MOUSE WHEEL ZOOM
     ======================================================= */

  lightboxImage.addEventListener(
    "wheel",
    event => {

      event.preventDefault();


      if(
        event.deltaY < 0
      ){

        zoomImage(
          zoomLevel +
          zoomStep
        );

      }else{

        zoomImage(
          zoomLevel -
          zoomStep
        );

      }

    },
    {
      passive:false
    }
  );


  /* =======================================================
     DOUBLE CLICK
     ======================================================= */

  lightboxImage.addEventListener(
    "dblclick",
    () => {

      if(
        zoomLevel === 1
      ){

        zoomImage(2);

      }else{

        resetZoom();

      }

    }
  );


  /* =======================================================
     VISIBILITY
     ======================================================= */

  document.addEventListener(
    "visibilitychange",
    () => {

      if(document.hidden){

        stopAutoplay();

      }else{

        if(
          !lightbox.classList.contains(
            "is-open"
          )
        ){

          startAutoplay();

        }

      }

    }
  );


  /* =======================================================
     INIT
     ======================================================= */

  renderSlide(
    0,
    false
  );


  startAutoplay();


})();
document.addEventListener("DOMContentLoaded", function () {
  const elements = document.querySelectorAll("body *");

  elements.forEach(function (element) {
    if (element.children.length === 0) {
      element.textContent = element.textContent
        .replace(/0/g, "۰")
        .replace(/1/g, "۱")
        .replace(/2/g, "۲")
        .replace(/3/g, "۳")
        .replace(/4/g, "۴")
        .replace(/5/g, "۵")
        .replace(/6/g, "۶")
        .replace(/7/g, "۷")
        .replace(/8/g, "۸")
        .replace(/9/g, "۹");
    }
  });
});


////////////
// SW - PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((registration) => {
        console.log(
          "Service Worker registered:",
          registration.scope
        );
      })
      .catch((error) => {
        console.error(
          "Service Worker registration failed:",
          error
        );
      });
  });
}