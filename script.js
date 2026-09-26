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


// ---------------------------------------------------------
// Before / After slider (Swiper-style behaviour, no CDN needed)
// ---------------------------------------------------------
(function initBeforeAfterSlider(){
  const root = document.querySelector('[data-swiper]');
  if(!root) return;
  const wrapper = root.querySelector('.ba-swiper-wrapper');
  const slides = Array.from(root.querySelectorAll('.ba-swiper-slide'));
  const shell = root.closest('.ba-slider-wrap');
  const prev = shell?.querySelector('.ba-prev');
  const next = shell?.querySelector('.ba-next');
  const pagination = shell?.querySelector('.ba-pagination');
  if(!wrapper || !slides.length) return;

  let index = 0;
  let perView = 1;
  let timer = null;

  function getPerView(){
    if(window.innerWidth >= 900) return 2;
    return 1;
  }
  function getMaxIndex(){ return Math.max(0, slides.length - perView); }
  function clampIndex(){ index = Math.min(index, getMaxIndex()); }

  function buildPagination(){
    if(!pagination) return;
    pagination.innerHTML='';
    const count=getMaxIndex()+1;
    for(let i=0;i<count;i++){
      const b=document.createElement('button');
      b.className='ba-bullet'+(i===index?' is-active':'');
      b.type='button';
      b.setAttribute('aria-label','نمایش اسلاید '+(i+1));
      b.addEventListener('click',()=>{ goTo(i); restart(); });
      pagination.appendChild(b);
    }
  }

  function render(){
    perView=getPerView();
    clampIndex();
    const step = 100 / perView;
    wrapper.style.transform = `translate3d(${index * step * (document.documentElement.dir === 'rtl' ? 1 : -1)}%,0,0)`;
    // direction is ltr inside the track; translate left is negative.
    wrapper.style.transform = `translate3d(-${index * step}%,0,0)`;
    pagination?.querySelectorAll('.ba-bullet').forEach((b,i)=>b.classList.toggle('is-active',i===index));
  }
  function goTo(i){
    index=(i+getMaxIndex()+1)%(getMaxIndex()+1 || 1);
    render();
  }
  function nextSlide(){goTo(index+1);}
  function prevSlide(){goTo(index-1);}
  function restart(){
    clearInterval(timer);
    timer=setInterval(nextSlide,5200);
  }

  next?.addEventListener('click',()=>{nextSlide();restart();});
  prev?.addEventListener('click',()=>{prevSlide();restart();});
  root.addEventListener('mouseenter',()=>clearInterval(timer));
  root.addEventListener('mouseleave',restart);
  root.addEventListener('touchstart',()=>clearInterval(timer),{passive:true});
  root.addEventListener('touchend',restart,{passive:true});
  let resizeTimer;
  window.addEventListener('resize',()=>{
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(()=>{buildPagination();render();restart();},120);
  });

  buildPagination();
  render();
  restart();
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
