import { useState } from "react";

/* ── TOKENS ─────────────────────────────────── */
const T = {
  red:"#C8102E", redL:"#fdf1f3", redM:"#f5d0d6",
  green:"#1a6b3c", greenL:"#f0faf4", greenM:"#c3e6d0",
  gold:"#F5C842", bg:"#f5f6f8", text:"#111827",
  muted:"#6b7280", border:"#e5e7eb",
};

/* ── TRANSLATIONS ────────────────────────────── */
const LANG = {
  en:{
    topBar:"🇧🇩 Bangladesh's #1 Rental & Property Portal — 1.2M+ users trust BashaBD",
    signIn:"Sign In", register:"Register", agentLogin:"Agent Login", langBtn:"বাংলা 🇧🇩",
    listBtn:"+ List Property Free",
    tenantMode:"🔍 I'm Looking to Rent", ownerMode:"🏠 I Have a Property to List",
    heroT1:"Find Your Next", heroT2:"Home to Rent or Buy", heroT3:"",
    heroTSub:"Search thousands of verified rentals across all 8 divisions",
    heroO1:"List Your Vacant Property", heroO2:"Reach 1.2M+ Tenants — Free",
    heroOSub:"Under 5 minutes · No agent fees · Direct tenant contact · Set inspection times",
    startFree:"🚀 Start Free Listing →",
    searchPh:"🔍  Area, road, city… (e.g. Gulshan, Uttara)", searchBtn:"Search",
    filtersBtn:"⚙ Filters", resetBtn:"✕ Reset",
    quickLabel:"QUICK FILTERS:", clearAll:"✕ Clear all",
    browseAreas:"Browse Popular Areas", viewAll:"View all →",
    govTitle:"🏛 OFFICIAL GOVERNMENT RESOURCES — BANGLADESH",
    startListBtn:"📋 Start Listing My Property",
    listFreeBtn:"{L.listFreeBtn}",
    enquireBtn:"✉️ Enquire Now", callBtn:"📞 Call", inspectBtn:"📅 Inspect",
    overviewTab:"🏠 Overview", utilTab:"⚡ Utilities", msgTab:"✉️ Message", inspTab:"📅 Inspections",
    noMatch:"No properties match your search", clearFilters:"Clear Filters",
    // Auth
    loginTitle:"Welcome Back", loginSub:"Sign in to your BashaBD account",
    registerTitle:"Create Account", registerSub:"Join Bangladesh's #1 property portal",
    emailLabel:"Email Address", passwordLabel:"Password", confirmPassLabel:"Confirm Password",
    fullNameLabel:"Full Name", phoneLabel:"Phone Number", divisionLabel:"Division / City",
    roleLabel:"I am a...", roleTenant:"🔍 Tenant (Looking to Rent/Buy)", roleOwner:"🏠 Owner (Have Property)", roleAgent:"👔 Agent (Real Estate Professional)",
    nidLabel:"NID Number (optional)", agentLicLabel:"Agent License No. (optional)", photoLabel:"Profile Photo (optional)",
    loginBtn:"Sign In", registerBtn:"Create Account", googleBtn:"Continue with Google", facebookBtn:"Continue with Facebook", phoneBtn:"Continue with Phone",
    forgotPass:"Forgot Password?", noAccount:"Don't have an account?", hasAccount:"Already have an account?",
    signUpLink:"Sign Up", signInLink:"Sign In",
    orDivider:"OR",
    otpTitle:"Enter OTP", otpSub:"We sent a 6-digit code to", otpLabel:"6-digit OTP code", verifyBtn:"Verify & Sign In", resendOtp:"Resend OTP",
    // Dashboards
    tenantDashTitle:"My Dashboard", ownerDashTitle:"Owner Dashboard",
    savedProps:"Saved Properties", myBookings:"My Inspection Bookings", myMessages:"My Messages",
    myListings:"My Listings", newListing:"+ New Listing", totalEnquiries:"Total Enquiries", totalViews:"Total Views",
    pendingBookings:"Pending Bookings", activeListings:"Active Listings",
    logoutBtn:"Sign Out", editProfile:"Edit Profile",
    welcomeBack:"Welcome back",
  },
  bn:{
    topBar:"🇧🇩 বাংলাদেশের #১ ভাড়া ও সম্পত্তি পোর্টাল — ১২ লক্ষ+ ব্যবহারকারী",
    signIn:"সাইন ইন", register:"নিবন্ধন", agentLogin:"এজেন্ট", langBtn:"English 🇬🇧",
    listBtn:"+ বিনামূল্যে তালিকা দিন",
    tenantMode:"🔍 আমি ভাড়া খুঁজছি", ownerMode:"🏠 আমার সম্পত্তি আছে",
    heroT1:"আপনার পরবর্তী", heroT2:"বাড়ি ভাড়া বা কিনুন", heroT3:"",
    heroTSub:"সারা বাংলাদেশে হাজারো যাচাইকৃত ভাড়া সম্পত্তি",
    heroO1:"আপনার খালি সম্পত্তি তালিকা দিন", heroO2:"১২ লক্ষ+ ভাড়াটিয়ার কাছে পৌঁছান — বিনামূল্যে",
    heroOSub:"মাত্র ৫ মিনিটে · কোনো এজেন্ট ফি নেই · সরাসরি যোগাযোগ",
    startFree:"🚀 বিনামূল্যে শুরু করুন →",
    searchPh:"🔍  এলাকা, রাস্তা, শহর… (যেমন গুলশান, উত্তরা)", searchBtn:"খুঁজুন",
    filtersBtn:"⚙ ফিল্টার", resetBtn:"✕ রিসেট",
    quickLabel:"দ্রুত ফিল্টার:", clearAll:"✕ সব মুছুন",
    browseAreas:"জনপ্রিয় এলাকা দেখুন", viewAll:"সব দেখুন →",
    govTitle:"🏛 সরকারি সম্পদ — বাংলাদেশ",
    startListBtn:"📋 তালিকা শুরু করুন",
    listFreeBtn:"এখনই বিনামূল্যে →",
    enquireBtn:"✉️ জিজ্ঞেস করুন", callBtn:"📞 ফোন", inspectBtn:"📅 পরিদর্শন",
    overviewTab:"🏠 বিবরণ", utilTab:"⚡ সুবিধা", msgTab:"✉️ বার্তা", inspTab:"📅 পরিদর্শন",
    noMatch:"কোনো সম্পত্তি পাওয়া যায়নি", clearFilters:"ফিল্টার মুছুন",
    // Auth
    loginTitle:"স্বাগতম", loginSub:"আপনার BashaBD অ্যাকাউন্টে সাইন ইন করুন",
    registerTitle:"অ্যাকাউন্ট তৈরি করুন", registerSub:"বাংলাদেশের #১ সম্পত্তি পোর্টালে যোগ দিন",
    emailLabel:"ইমেইল ঠিকানা", passwordLabel:"পাসওয়ার্ড", confirmPassLabel:"পাসওয়ার্ড নিশ্চিত করুন",
    fullNameLabel:"পুরো নাম", phoneLabel:"ফোন নম্বর", divisionLabel:"বিভাগ / শহর",
    roleLabel:"আমি হলাম...", roleTenant:"🔍 ভাড়াটিয়া (ভাড়া/কিনতে চাই)", roleOwner:"🏠 মালিক (সম্পত্তি আছে)", roleAgent:"👔 এজেন্ট (রিয়েল এস্টেট পেশাদার)",
    nidLabel:"NID নম্বর (ঐচ্ছিক)", agentLicLabel:"এজেন্ট লাইসেন্স নং (ঐচ্ছিক)", photoLabel:"প্রোফাইল ছবি (ঐচ্ছিক)",
    loginBtn:"সাইন ইন", registerBtn:"অ্যাকাউন্ট তৈরি করুন", googleBtn:"Google দিয়ে চালিয়ে যান", facebookBtn:"Facebook দিয়ে চালিয়ে যান", phoneBtn:"ফোন দিয়ে চালিয়ে যান",
    forgotPass:"পাসওয়ার্ড ভুলে গেছেন?", noAccount:"অ্যাকাউন্ট নেই?", hasAccount:"ইতিমধ্যে অ্যাকাউন্ট আছে?",
    signUpLink:"নিবন্ধন করুন", signInLink:"সাইন ইন করুন",
    orDivider:"অথবা",
    otpTitle:"OTP লিখুন", otpSub:"আমরা একটি ৬-সংখ্যার কোড পাঠিয়েছি", otpLabel:"৬ সংখ্যার OTP কোড", verifyBtn:"যাচাই করুন", resendOtp:"OTP পুনরায় পাঠান",
    // Dashboards
    tenantDashTitle:"আমার ড্যাশবোর্ড", ownerDashTitle:"মালিকের ড্যাশবোর্ড",
    savedProps:"সংরক্ষিত সম্পত্তি", myBookings:"আমার পরিদর্শন বুকিং", myMessages:"আমার বার্তা",
    myListings:"আমার তালিকা", newListing:"+ নতুন তালিকা", totalEnquiries:"মোট অনুসন্ধান", totalViews:"মোট ভিউ",
    pendingBookings:"অপেক্ষমাণ বুকিং", activeListings:"সক্রিয় তালিকা",
    logoutBtn:"সাইন আউট", editProfile:"প্রোফাইল সম্পাদনা",
    welcomeBack:"স্বাগত",
  },
};

/* ── STATIC DATA ─────────────────────────────── */
const PROPERTIES = [
  { id:1,  title:"Spacious 3-Bed in Bashundhara R/A",  type:"apartment",  status:"for-rent", price:32000,  area:1450, beds:3, baths:2, cars:1, floor:7,  location:"Bashundhara R/A, Dhaka",   division:"Dhaka",      img:"https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=600&q=80", featured:true,  tags:["Semi-Furnished","Gas","Generator"], petFriendly:false, flatmate:false, utilities:["Gas","Water","Generator"], inspSlots:["Fri 30 May — 10:00 AM","Fri 30 May — 2:00 PM","Sat 31 May — 11:00 AM"], agent:"Rahim & Sons", phone:"01711-234567", age:1 },
  { id:2,  title:"Modern Studio near Gulshan 1",        type:"apartment",  status:"for-rent", price:18000,  area:480,  beds:1, baths:1, cars:0, floor:4,  location:"Gulshan 1, Dhaka",         division:"Dhaka",      img:"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80", featured:true,  tags:["Furnished","WiFi","AC"],           petFriendly:true,  flatmate:true,  utilities:["WiFi","Water","AC"],          inspSlots:["Sat 31 May — 10:00 AM","Sun 1 Jun — 10:00 AM"],                        agent:"Home Finders BD", phone:"01811-345678", age:2 },
  { id:3,  title:"Family Flat in Uttara Sector 6",      type:"apartment",  status:"for-rent", price:22000,  area:1200, beds:3, baths:2, cars:0, floor:3,  location:"Uttara Sector 6, Dhaka",   division:"Dhaka",      img:"https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&q=80", featured:false, tags:["Unfurnished","Generator"],         petFriendly:false, flatmate:false, utilities:["Gas","Water","Generator"],    inspSlots:["Sun 1 Jun — 11:00 AM","Mon 2 Jun — 4:00 PM"],                          agent:"Trust Realty", phone:"01911-456789", age:5 },
  { id:4,  title:"Office Space – Full Floor, Banani",   type:"commercial", status:"for-rent", price:150000, area:6000, beds:0, baths:4, cars:5, floor:12, location:"Banani, Dhaka",             division:"Dhaka",      img:"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80", featured:true,  tags:["Full Floor","24/7 Gen","Lift"],    petFriendly:false, flatmate:false, utilities:["Generator","Lift"],            inspSlots:["Mon 2 Jun — 10:00 AM","Tue 3 Jun — 10:00 AM"],                         agent:"Corporate BD", phone:"01611-567890", age:3 },
  { id:5,  title:"Cozy 2-Bed near Dhanmondi Lake",     type:"apartment",  status:"for-rent", price:28000,  area:950,  beds:2, baths:1, cars:0, floor:5,  location:"Dhanmondi, Dhaka",          division:"Dhaka",      img:"https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80", featured:false, tags:["Semi-Furnished","Lake View"],      petFriendly:true,  flatmate:true,  utilities:["Water","Gas"],                inspSlots:["Sat 31 May — 9:00 AM","Sat 31 May — 1:00 PM"],                         agent:"Lake View Homes", phone:"01711-678901", age:2 },
  { id:6,  title:"Sea-View Flat, Panchlaish CDA",      type:"apartment",  status:"for-rent", price:25000,  area:1100, beds:2, baths:2, cars:1, floor:8,  location:"Panchlaish, Chittagong",   division:"Chittagong", img:"https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80", featured:true,  tags:["Sea View","Semi-Furnished","AC"],  petFriendly:false, flatmate:false, utilities:["AC","Water","Gas"],            inspSlots:["Fri 30 May — 3:00 PM","Sat 31 May — 10:00 AM"],                        agent:"Port City Homes", phone:"01511-789012", age:1 },
  { id:7,  title:"Budget Room in Mirpur 10",           type:"room",       status:"for-rent", price:7000,   area:200,  beds:1, baths:1, cars:0, floor:2,  location:"Mirpur 10, Dhaka",          division:"Dhaka",      img:"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80", featured:false, tags:["Attached Bath","WiFi"],            petFriendly:false, flatmate:true,  utilities:["WiFi","Water"],               inspSlots:["Any day — Call to arrange"],                                            agent:"Mirpur Rentals", phone:"01811-890123", age:1 },
  { id:8,  title:"Luxury Penthouse, Baridhara",        type:"apartment",  status:"for-rent", price:120000, area:4200, beds:5, baths:4, cars:2, floor:18, location:"Baridhara, Dhaka",          division:"Dhaka",      img:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", featured:true,  tags:["Fully Furnished","Pool","Gym"],    petFriendly:true,  flatmate:false, utilities:["AC","Pool","Gym","Generator"], inspSlots:["By appointment — Call agent"],                                           agent:"Luxury Lets BD", phone:"01711-901234", age:4 },
  { id:9,  title:"Luxury Apartment for Sale, Gulshan", type:"apartment",  status:"for-sale", price:12500000,area:2200,beds:4, baths:3, cars:1, floor:10, location:"Gulshan 2, Dhaka",          division:"Dhaka",      img:"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80", featured:true,  tags:["Ready","Corner","Lift"],           petFriendly:false, flatmate:false, utilities:[],                             inspSlots:["By appointment — Call agent"],                                           agent:"Rahim Properties", phone:"01711-234567", age:2 },
  { id:10, title:"RAJUK Plot – Purbachal New Town",    type:"land",       status:"for-sale", price:8500000, area:2178,beds:0, baths:0, cars:0, floor:0,  location:"Purbachal New Town, Dhaka", division:"Dhaka",      img:"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80", featured:false, tags:["RAJUK Approved","Corner Plot"],   petFriendly:false, flatmate:false, utilities:[],                             inspSlots:["Sat 31 May — 9:00 AM","Sun 1 Jun — 9:00 AM"],                           agent:"Plot BD", phone:"01611-567890", age:12 },
];

const DIVISIONS = ["All Divisions","Dhaka","Chittagong","Sylhet","Rajshahi","Khulna","Barishal","Rangpur","Mymensingh"];
const PTYPES    = ["All Types","Apartment","Room","House","Commercial","Land"];
const AREAS     = ["Gulshan","Banani","Dhanmondi","Bashundhara","Uttara","Mirpur","Baridhara","Motijheel","Wari","Mohakhali"];
const GOV_LINKS = [
  {label:"RAJUK",url:"https://rajuk.gov.bd",icon:"🏛"},{label:"Land Ministry",url:"https://minland.gov.bd",icon:"📜"},
  {label:"e-Porcha",url:"https://eporcha.gov.bd",icon:"🗺"},{label:"NHA",url:"https://nha.gov.bd",icon:"🏠"},
  {label:"CDA Ctg",url:"https://www.cda.gov.bd",icon:"🏙"},{label:"e-Mutation",url:"https://mutation.land.gov.bd",icon:"📋"},
  {label:"NBR Tax",url:"https://nbr.gov.bd",icon:"💰"},{label:"Land Records",url:"https://www.land.gov.bd",icon:"📂"},
  {label:"BRTA",url:"https://brta.gov.bd",icon:"🚗"},{label:"KDA Khulna",url:"https://kda.gov.bd",icon:"🌿"},
];
const QUICK_FILTERS = [
  {label:"🛋 Furnished",key:"furnished"},{label:"🐾 Pet Friendly",key:"pet"},
  {label:"👥 Flatmate",key:"flatmate"},{label:"🚗 Parking",key:"parking"},
  {label:"⚡ Generator",key:"gen"},{label:"❄️ AC",key:"ac"},
  {label:"🏋 Gym/Pool",key:"gym"},{label:"📶 WiFi",key:"wifi"},
  {label:"💡 Utils Incl.",key:"utilities"},{label:"🏢 Ground Floor",key:"ground"},
];

/* ── HELPERS ─────────────────────────────────── */
function fmtPrice(price, status) {
  if (status==="for-rent") return {main:`৳${price.toLocaleString("en-BD")}`,sub:"/mo"};
  if (price>=10000000) return {main:`৳${(price/10000000).toFixed(2)} Cr`,sub:""};
  if (price>=100000)   return {main:`৳${(price/100000).toFixed(1)} Lac`,sub:""};
  return {main:`৳${price.toLocaleString("en-BD")}`,sub:""};
}
function affordBadge(price) {
  if (price<=15000) return {text:"💚 Budget",bg:"#f0fdf4",c:"#166534"};
  if (price<=40000) return {text:"💛 Mid Range",bg:"#fefce8",c:"#854d0e"};
  return                   {text:"💎 Premium",bg:"#fdf1f3",c:"#9f1239"};
}

/* ════════════════════════════════════════════════
   AUTH MODAL
════════════════════════════════════════════════ */
function AuthModal({mode, onClose, onSuccess, L}) {
  const [view,      setView]      = useState(mode); // login | register | otp
  const [role,      setRole]      = useState("tenant");
  const [showPass,  setShowPass]  = useState(false);
  const [otpSent,   setOtpSent]   = useState(false);
  const [otp,       setOtp]       = useState(["","","","","",""]);
  const [loading,   setLoading]   = useState(false);
  const [step,      setStep]      = useState(1); // register steps 1=basic 2=details
  const [form, setForm] = useState({
    email:"", password:"", confirmPass:"", fullName:"", phone:"", division:"Dhaka",
    nid:"", agentLic:"", photo:null,
  });
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleOtpChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp]; next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) document.getElementById(`otp-${i+1}`)?.focus();
  };

  const fakeAuth = (r) => {
    setLoading(true);
    setTimeout(()=>{ setLoading(false); onSuccess({name:form.fullName||"User", email:form.email, phone:form.phone, role:r||role}); }, 1200);
  };

  const Inp = ({label, k, type="text", placeholder=""}) => (
    <div style={{marginBottom:12}}>
      <div style={{fontSize:11,fontWeight:700,color:T.muted,marginBottom:4,letterSpacing:.5}}>{label}</div>
      <input value={form[k]} onChange={e=>upd(k,e.target.value)} type={showPass&&type==="password"?"text":type} placeholder={placeholder}
        style={{width:"100%",padding:"11px 13px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
    </div>
  );

  const SocialBtn = ({icon, label, bg, textColor, border, onClick}) => (
    <button onClick={onClick} style={{width:"100%",padding:"11px 14px",
      border:`1.5px solid ${border||T.border}`,borderRadius:10,
      background:bg||"#fff",cursor:"pointer",
      display:"flex",alignItems:"center",justifyContent:"center",gap:10,
      fontWeight:700,fontSize:13,color:textColor||T.text,marginBottom:8,
      transition:"all .2s",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,0.12)";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.06)";}}>
      <span style={{fontSize:20,lineHeight:1}}>{icon}</span> {label}
    </button>
  );

  const [phoneInput, setPhoneInput] = useState("");

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:5000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:22,width:"100%",maxWidth:440,maxHeight:"95vh",overflowY:"auto",boxShadow:"0 24px 80px rgba(0,0,0,0.35)"}}>

        {/* Header */}
        <div style={{background:`linear-gradient(135deg,${T.red},#a00d24)`,padding:"24px 28px 20px",borderRadius:"22px 22px 0 0",position:"relative"}}>
          <button onClick={onClose} style={{position:"absolute",top:14,right:14,background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:32,height:32,color:"#fff",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <div style={{background:"rgba(255,255,255,0.2)",borderRadius:10,width:42,height:42,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🏠</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,color:"#fff"}}>Basha<span style={{color:T.gold}}>BD</span></div>
          </div>
          <div style={{color:"#fff",fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900}}>
            {view==="otp" ? L.otpTitle : view==="register" ? L.registerTitle : L.loginTitle}
          </div>
          <div style={{color:"rgba(255,255,255,0.8)",fontSize:13,marginTop:3}}>
            {view==="otp" ? `${L.otpSub} ${form.phone}` : view==="register" ? L.registerSub : L.loginSub}
          </div>
        </div>

        <div style={{padding:"24px 28px 28px"}}>

          {/* PHONE INPUT VIEW */}
          {view==="phone" && (
            <div>
              <div style={{fontSize:13,color:T.muted,marginBottom:16}}>Enter your Bangladesh phone number to receive a verification code:</div>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,color:T.muted,marginBottom:4,letterSpacing:.5}}>PHONE NUMBER *</div>
                <div style={{display:"flex",gap:8}}>
                  <div style={{background:"#f9fafb",border:`1.5px solid ${T.border}`,borderRadius:9,padding:"11px 13px",fontSize:13,fontWeight:700,color:T.text,whiteSpace:"nowrap"}}>🇧🇩 +880</div>
                  <input value={phoneInput} onChange={e=>setPhoneInput(e.target.value.replace(/\D/g,""))}
                    placeholder="01711-234567" maxLength={11}
                    style={{flex:1,padding:"11px 13px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,outline:"none"}}/>
                </div>
                <div style={{fontSize:11,color:T.muted,marginTop:5}}>We'll send a 6-digit OTP via SMS</div>
              </div>
              <button onClick={()=>{if(phoneInput.length>=11){upd("phone",phoneInput);setView("otp");}}}
                disabled={phoneInput.length<11}
                style={{width:"100%",background:phoneInput.length>=11?"#25D366":"#d1d5db",color:"#fff",border:"none",padding:"13px",borderRadius:11,fontWeight:800,fontSize:15,cursor:"pointer",marginBottom:12}}>
                📱 Send OTP Code
              </button>
              <button onClick={()=>setView(mode)} style={{width:"100%",padding:"11px",border:`1.5px solid ${T.border}`,borderRadius:11,background:"#fff",fontWeight:600,fontSize:13,cursor:"pointer",color:T.muted}}>
                ← Back
              </button>
            </div>
          )}

          {/* OTP VIEW */}
          {view==="otp" && (
            <div>
              <div style={{fontSize:13,color:T.muted,marginBottom:20}}>{L.otpLabel}:</div>
              <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:20}}>
                {otp.map((digit,i)=>(
                  <input key={i} id={`otp-${i}`} value={digit} onChange={e=>handleOtpChange(i,e.target.value)}
                    maxLength={1} style={{width:44,height:52,textAlign:"center",fontSize:22,fontWeight:800,
                      border:`2px solid ${digit?T.red:T.border}`,borderRadius:10,outline:"none",color:T.text}}/>
                ))}
              </div>
              <button onClick={()=>fakeAuth(role)} disabled={loading||otp.join("").length!==6}
                style={{width:"100%",background:otp.join("").length===6?T.green:"#d1d5db",color:"#fff",border:"none",padding:"13px",borderRadius:11,fontWeight:800,fontSize:15,cursor:"pointer",marginBottom:12}}>
                {loading?"⏳ Verifying...":L.verifyBtn}
              </button>
              <div style={{textAlign:"center",fontSize:13,color:T.muted}}>
                {L.resendOtp}? <span onClick={()=>setOtp(["","","","","",""])} style={{color:T.red,fontWeight:700,cursor:"pointer"}}>Resend</span>
              </div>
            </div>
          )}

          {/* LOGIN VIEW */}
          {view==="login" && (
            <div>
              {/* Social login — all 4 methods */}
              <SocialBtn icon="🔴" label={L.googleBtn} bg="#fff" border="#dadce0" textColor="#3c4043"
                onClick={()=>fakeAuth("tenant")}/>
              <SocialBtn icon="🔷" label={L.facebookBtn} bg="#1877F2" border="#1877F2" textColor="#fff"
                onClick={()=>fakeAuth("tenant")}/>
              <SocialBtn icon="📱" label={L.phoneBtn} bg="#25D366" border="#25D366" textColor="#fff"
                onClick={()=>setView("phone")}/>

              <div style={{display:"flex",alignItems:"center",gap:10,margin:"16px 0"}}>
                <div style={{flex:1,height:1,background:T.border}}/><span style={{fontSize:12,color:T.muted,fontWeight:600}}>{L.orDivider}</span><div style={{flex:1,height:1,background:T.border}}/>
              </div>

              <Inp label={L.emailLabel} k="email" type="email" placeholder="example@email.com"/>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:700,color:T.muted,marginBottom:4,letterSpacing:.5}}>{L.passwordLabel}</div>
                <div style={{position:"relative"}}>
                  <input value={form.password} onChange={e=>upd("password",e.target.value)} type={showPass?"text":"password"} placeholder="••••••••"
                    style={{width:"100%",padding:"11px 40px 11px 13px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                  <button onClick={()=>setShowPass(!showPass)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:T.muted}}>
                    {showPass?"🙈":"👁"}
                  </button>
                </div>
              </div>
              <div style={{textAlign:"right",marginBottom:16}}>
                <span style={{fontSize:12,color:T.red,fontWeight:600,cursor:"pointer"}}>{L.forgotPass}</span>
              </div>

              <button onClick={()=>fakeAuth()} disabled={loading||!form.email||!form.password}
                style={{width:"100%",background:form.email&&form.password?T.red:"#d1d5db",color:"#fff",border:"none",padding:"13px",borderRadius:11,fontWeight:800,fontSize:15,cursor:"pointer",marginBottom:16}}>
                {loading?"⏳ Signing in...":L.loginBtn}
              </button>

              <div style={{textAlign:"center",fontSize:13,color:T.muted}}>
                {L.noAccount} <span onClick={()=>setView("register")} style={{color:T.red,fontWeight:700,cursor:"pointer"}}>{L.signUpLink}</span>
              </div>
            </div>
          )}

          {/* REGISTER VIEW — STEP 1 */}
          {view==="register" && step===1 && (
            <div>
              {/* Social register — all 4 methods */}
              <SocialBtn icon="🔴" label={L.googleBtn} bg="#fff" border="#dadce0" textColor="#3c4043"
                onClick={()=>fakeAuth("tenant")}/>
              <SocialBtn icon="🔷" label={L.facebookBtn} bg="#1877F2" border="#1877F2" textColor="#fff"
                onClick={()=>fakeAuth("tenant")}/>
              <SocialBtn icon="📱" label={L.phoneBtn} bg="#25D366" border="#25D366" textColor="#fff"
                onClick={()=>setView("phone")}/>
              <div style={{display:"flex",alignItems:"center",gap:10,margin:"14px 0"}}>
                <div style={{flex:1,height:1,background:T.border}}/><span style={{fontSize:12,color:T.muted,fontWeight:600}}>{L.orDivider}</span><div style={{flex:1,height:1,background:T.border}}/>
              </div>

              {/* Role selector */}
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,color:T.muted,marginBottom:8,letterSpacing:.5}}>{L.roleLabel}</div>
                <div style={{display:"flex",flexDirection:"column",gap:7}}>
                  {[["tenant",L.roleTenant],["owner",L.roleOwner],["agent",L.roleAgent]].map(([val,label])=>(
                    <button key={val} onClick={()=>setRole(val)} style={{
                      padding:"10px 14px",border:"2px solid",borderRadius:10,cursor:"pointer",textAlign:"left",
                      fontWeight:700,fontSize:12,transition:"all .15s",
                      borderColor:role===val?T.green:T.border,background:role===val?T.greenL:"#fff",color:role===val?T.green:T.text
                    }}>{label}</button>
                  ))}
                </div>
              </div>

              <Inp label={L.fullNameLabel} k="fullName" placeholder="Mohammad Hasan"/>
              <Inp label={L.emailLabel} k="email" type="email" placeholder="example@email.com"/>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:700,color:T.muted,marginBottom:4,letterSpacing:.5}}>{L.passwordLabel}</div>
                <div style={{position:"relative"}}>
                  <input value={form.password} onChange={e=>upd("password",e.target.value)} type={showPass?"text":"password"} placeholder="Min 8 characters"
                    style={{width:"100%",padding:"11px 40px 11px 13px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                  <button onClick={()=>setShowPass(!showPass)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:T.muted}}>
                    {showPass?"🙈":"👁"}
                  </button>
                </div>
              </div>

              <button onClick={()=>setStep(2)} disabled={!form.fullName||!form.email||!form.password}
                style={{width:"100%",background:form.fullName&&form.email&&form.password?T.red:"#d1d5db",color:"#fff",border:"none",padding:"13px",borderRadius:11,fontWeight:800,fontSize:15,cursor:"pointer",marginBottom:16}}>
                Continue →
              </button>
              <div style={{textAlign:"center",fontSize:13,color:T.muted}}>
                {L.hasAccount} <span onClick={()=>setView("login")} style={{color:T.red,fontWeight:700,cursor:"pointer"}}>{L.signInLink}</span>
              </div>
            </div>
          )}

          {/* REGISTER VIEW — STEP 2 */}
          {view==="register" && step===2 && (
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18,padding:"10px 14px",background:T.greenL,border:`1px solid ${T.greenM}`,borderRadius:10}}>
                <div style={{width:36,height:36,background:T.green,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:14}}>
                  {form.fullName?.[0]||"U"}
                </div>
                <div>
                  <div style={{fontWeight:700,fontSize:13,color:T.green}}>{form.fullName}</div>
                  <div style={{fontSize:11,color:T.muted}}>{form.email} · {role==="tenant"?"Tenant":role==="owner"?"Owner":"Agent"}</div>
                </div>
              </div>

              <Inp label={`${L.phoneLabel} *`} k="phone" placeholder="01711-234567"/>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:700,color:T.muted,marginBottom:4,letterSpacing:.5}}>{L.divisionLabel} *</div>
                <select value={form.division} onChange={e=>upd("division",e.target.value)}
                  style={{width:"100%",padding:"11px 13px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,color:"#444",background:"#fff",outline:"none"}}>
                  {DIVISIONS.slice(1).map(d=><option key={d}>{d}</option>)}
                </select>
              </div>

              {/* Optional fields */}
              <div style={{background:"#f9fafb",border:`1px solid ${T.border}`,borderRadius:11,padding:"14px",marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,color:T.muted,letterSpacing:.5,marginBottom:12}}>OPTIONAL — ADD LATER</div>
                <Inp label={L.nidLabel} k="nid" placeholder="17-digit NID number"/>
                {role==="agent" && <Inp label={L.agentLicLabel} k="agentLic" placeholder="Agent license number"/>}
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:T.muted,marginBottom:4,letterSpacing:.5}}>{L.photoLabel}</div>
                  <div style={{border:`2px dashed ${T.border}`,borderRadius:9,padding:"16px",textAlign:"center",cursor:"pointer",color:T.muted,fontSize:12}}>
                    📷 Click to upload profile photo
                  </div>
                </div>
              </div>

              <button onClick={()=>fakeAuth()} disabled={loading||!form.phone}
                style={{width:"100%",background:form.phone?T.green:"#d1d5db",color:"#fff",border:"none",padding:"13px",borderRadius:11,fontWeight:800,fontSize:15,cursor:"pointer",marginBottom:10}}>
                {loading?"⏳ Creating account...":L.registerBtn}
              </button>
              <button onClick={()=>setStep(1)} style={{width:"100%",padding:"11px",border:`1.5px solid ${T.border}`,borderRadius:11,background:"#fff",fontWeight:600,fontSize:13,cursor:"pointer",color:T.muted}}>
                ← Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   TENANT DASHBOARD
════════════════════════════════════════════════ */
function TenantDashboard({user, onLogout, L, lang}) {
  const [tab, setTab] = useState("saved");
  const savedMock = PROPERTIES.slice(0,3);
  const bookingsMock = [{id:1,prop:"Spacious 3-Bed in Bashundhara R/A",slot:"Fri 30 May — 10:00 AM",status:"confirmed"},
                        {id:2,prop:"Modern Studio near Gulshan 1",slot:"Sat 31 May — 10:00 AM",status:"pending"}];
  const msgsMock = [{id:1,prop:"Sea-View Flat, Panchlaish CDA",msg:"I'm interested in scheduling a visit.",date:"2 hours ago",read:false},
                    {id:2,prop:"Cozy 2-Bed near Dhanmondi Lake",msg:"Is the property still available?",date:"1 day ago",read:true}];
  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      {/* Header */}
      <div style={{background:T.green,color:"#fff",padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontWeight:900,fontSize:20}}>Basha<span style={{color:T.gold}}>BD</span></div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,background:"rgba(255,255,255,0.2)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:16}}>
            {user.name?.[0]||"U"}
          </div>
          <div>
            <div style={{fontWeight:700,fontSize:13}}>{L.welcomeBack}, {user.name?.split(" ")[0]}!</div>
            <div style={{fontSize:11,opacity:.8}}>🔍 Tenant Account</div>
          </div>
          <button onClick={onLogout} style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:8,padding:"6px 14px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",marginLeft:8}}>
            {L.logoutBtn}
          </button>
        </div>
      </div>

      <div style={{maxWidth:1000,margin:"0 auto",padding:"24px 20px"}}>
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:14,marginBottom:28}}>
          {[[savedMock.length,"🏠",L.savedProps],[bookingsMock.length,"📅",L.myBookings],[msgsMock.length,"✉️",L.myMessages]].map(([n,icon,label])=>(
            <div key={label} style={{background:"#fff",borderRadius:14,padding:"18px 16px",boxShadow:T.shadow,textAlign:"center",border:`1px solid ${T.border}`}}>
              <div style={{fontSize:28}}>{icon}</div>
              <div style={{fontSize:28,fontWeight:900,color:T.red,fontFamily:"'Playfair Display',serif"}}>{n}</div>
              <div style={{fontSize:12,color:T.muted,fontWeight:600}}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:"flex",borderBottom:`2px solid ${T.border}`,marginBottom:20}}>
          {[["saved","🏠 "+L.savedProps],["bookings","📅 "+L.myBookings],["messages","✉️ "+L.myMessages]].map(([val,label])=>(
            <button key={val} onClick={()=>setTab(val)} style={{padding:"10px 18px",border:"none",background:"transparent",cursor:"pointer",fontWeight:700,fontSize:13,
              color:tab===val?T.red:T.muted,borderBottom:tab===val?`2.5px solid ${T.red}`:"2.5px solid transparent",marginBottom:-2}}>
              {label}
            </button>
          ))}
        </div>

        {/* Saved Properties */}
        {tab==="saved" && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
            {savedMock.map(p=>{
              const pr=fmtPrice(p.price,p.status);
              return (
                <div key={p.id} style={{background:"#fff",borderRadius:14,overflow:"hidden",border:`1px solid ${T.border}`,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
                  <img src={p.img} alt={p.title} style={{width:"100%",height:160,objectFit:"cover"}}/>
                  <div style={{padding:"12px 14px"}}>
                    <div style={{fontSize:18,fontWeight:900,color:T.red}}>{pr.main}<span style={{fontSize:11,color:T.muted}}>{pr.sub}</span></div>
                    <div style={{fontSize:13,fontWeight:700,color:T.text,marginTop:2}}>{p.title}</div>
                    <div style={{fontSize:11,color:T.muted,marginTop:2}}>📍 {p.location}</div>
                    <div style={{display:"flex",gap:8,marginTop:8}}>
                      <button style={{flex:1,background:T.red,color:"#fff",border:"none",padding:"8px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer"}}>📞 Call</button>
                      <button style={{flex:1,background:T.redL,color:T.red,border:`1px solid ${T.redM}`,padding:"8px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer"}}>🗑 Remove</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bookings */}
        {tab==="bookings" && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {bookingsMock.map(b=>(
              <div key={b.id} style={{background:"#fff",borderRadius:13,padding:"16px 18px",border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
                <div>
                  <div style={{fontWeight:700,fontSize:14,color:T.text}}>{b.prop}</div>
                  <div style={{fontSize:12,color:T.muted,marginTop:3}}>📅 {b.slot}</div>
                </div>
                <span style={{background:b.status==="confirmed"?T.greenL:T.redL,color:b.status==="confirmed"?T.green:T.red,padding:"4px 12px",borderRadius:20,fontSize:11,fontWeight:800,border:`1px solid ${b.status==="confirmed"?T.greenM:T.redM}`}}>
                  {b.status==="confirmed"?"✅ Confirmed":"⏳ Pending"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Messages */}
        {tab==="messages" && (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {msgsMock.map(m=>(
              <div key={m.id} style={{background:"#fff",borderRadius:13,padding:"16px 18px",border:`1px solid ${m.read?T.border:T.redM}`,boxShadow:"0 2px 8px rgba(0,0,0,0.05)",position:"relative"}}>
                {!m.read && <div style={{position:"absolute",top:16,right:16,width:8,height:8,background:T.red,borderRadius:"50%"}}/>}
                <div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:4}}>{m.prop}</div>
                <div style={{fontSize:12,color:T.muted,marginBottom:4}}>"{m.msg}"</div>
                <div style={{fontSize:11,color:"#bbb"}}>{m.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   OWNER DASHBOARD
════════════════════════════════════════════════ */
function OwnerDashboard({user, onLogout, L, onNewListing}) {
  const [tab, setTab] = useState("listings");
  const listingsMock = PROPERTIES.slice(0,4);
  const enquiriesMock = [
    {id:1,name:"Karim Ahmed",phone:"01711-111111",prop:"Spacious 3-Bed in Bashundhara",msg:"I'd like to schedule a viewing this weekend.",date:"1 hour ago",read:false},
    {id:2,name:"Fatema Begum",phone:"01811-222222",prop:"Modern Studio near Gulshan 1",msg:"Is negotiation possible on the rent?",date:"3 hours ago",read:true},
    {id:3,name:"Rahim Uddin",phone:"01911-333333",prop:"Family Flat in Uttara Sector 6",msg:"What's included in the rent?",date:"Yesterday",read:true},
  ];
  const bookingsMock = [
    {id:1,name:"Sadia Islam",prop:"Spacious 3-Bed in Bashundhara",slot:"Fri 30 May — 10:00 AM",status:"pending"},
    {id:2,name:"Tanvir Hossain",prop:"Cozy 2-Bed near Dhanmondi Lake",slot:"Sat 31 May — 9:00 AM",status:"confirmed"},
  ];

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      {/* Header */}
      <div style={{background:`linear-gradient(135deg,${T.green},#0a3d22)`,color:"#fff",padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontWeight:900,fontSize:20}}>Basha<span style={{color:T.gold}}>BD</span> <span style={{fontSize:12,opacity:.7,fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>Owner Dashboard</span></div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,background:"rgba(255,255,255,0.2)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:16}}>
            {user.name?.[0]||"O"}
          </div>
          <div>
            <div style={{fontWeight:700,fontSize:13}}>{L.welcomeBack}, {user.name?.split(" ")[0]}!</div>
            <div style={{fontSize:11,opacity:.8}}>🏠 Property Owner</div>
          </div>
          <button onClick={onLogout} style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:8,padding:"6px 14px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>
            {L.logoutBtn}
          </button>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"24px 20px"}}>
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:14,marginBottom:28}}>
          {[[listingsMock.length,"🏠",L.activeListings],[enquiriesMock.length,"✉️",L.totalEnquiries],[bookingsMock.length,"📅",L.pendingBookings],["1,284","👁",L.totalViews]].map(([n,icon,label])=>(
            <div key={label} style={{background:"#fff",borderRadius:14,padding:"18px 16px",boxShadow:"0 2px 12px rgba(0,0,0,0.07)",textAlign:"center",border:`1px solid ${T.border}`}}>
              <div style={{fontSize:26}}>{icon}</div>
              <div style={{fontSize:26,fontWeight:900,color:T.green,fontFamily:"'Playfair Display',serif"}}>{n}</div>
              <div style={{fontSize:11,color:T.muted,fontWeight:600}}>{label}</div>
            </div>
          ))}
        </div>

        {/* New Listing CTA */}
        <button onClick={onNewListing} style={{width:"100%",background:T.red,color:"#fff",border:"none",padding:"14px",borderRadius:12,fontWeight:900,fontSize:15,cursor:"pointer",marginBottom:22,display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 16px rgba(200,16,46,0.3)"}}>
          ➕ {L.newListing}
        </button>

        {/* Tabs */}
        <div style={{display:"flex",borderBottom:`2px solid ${T.border}`,marginBottom:20,overflowX:"auto"}}>
          {[["listings","🏠 "+L.myListings],["enquiries","✉️ "+L.totalEnquiries],["bookings","📅 "+L.pendingBookings]].map(([val,label])=>(
            <button key={val} onClick={()=>setTab(val)} style={{padding:"10px 18px",border:"none",background:"transparent",cursor:"pointer",fontWeight:700,fontSize:13,whiteSpace:"nowrap",
              color:tab===val?T.green:T.muted,borderBottom:tab===val?`2.5px solid ${T.green}`:"2.5px solid transparent",marginBottom:-2}}>
              {label}
            </button>
          ))}
        </div>

        {/* My Listings */}
        {tab==="listings" && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {listingsMock.map(p=>{
              const pr=fmtPrice(p.price,p.status);
              return (
                <div key={p.id} style={{background:"#fff",borderRadius:14,overflow:"hidden",border:`1px solid ${T.border}`,display:"flex",flexWrap:"wrap",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
                  <img src={p.img} alt={p.title} style={{width:120,height:90,objectFit:"cover",flexShrink:0}}/>
                  <div style={{flex:1,padding:"12px 16px",minWidth:200}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
                      <div>
                        <div style={{fontWeight:800,fontSize:14,color:T.text}}>{p.title}</div>
                        <div style={{fontSize:12,color:T.muted}}>📍 {p.location}</div>
                        <div style={{fontSize:16,fontWeight:900,color:T.green,marginTop:3}}>{pr.main}<span style={{fontSize:11,color:T.muted}}>{pr.sub}</span></div>
                      </div>
                      <div style={{display:"flex",gap:6}}>
                        <span style={{background:T.greenL,color:T.green,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,border:`1px solid ${T.greenM}`}}>✅ Active</span>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8,marginTop:10}}>
                      <button style={{background:T.greenL,color:T.green,border:`1px solid ${T.greenM}`,padding:"6px 14px",borderRadius:8,fontWeight:700,fontSize:11,cursor:"pointer"}}>✏️ Edit</button>
                      <button style={{background:T.redL,color:T.red,border:`1px solid ${T.redM}`,padding:"6px 14px",borderRadius:8,fontWeight:700,fontSize:11,cursor:"pointer"}}>⏸ Pause</button>
                      <button style={{background:"#f9fafb",color:T.muted,border:`1px solid ${T.border}`,padding:"6px 14px",borderRadius:8,fontWeight:700,fontSize:11,cursor:"pointer"}}>🗑 Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Enquiries */}
        {tab==="enquiries" && (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {enquiriesMock.map(e=>(
              <div key={e.id} style={{background:"#fff",borderRadius:13,padding:"16px 18px",border:`1px solid ${e.read?T.border:T.greenM}`,boxShadow:"0 2px 8px rgba(0,0,0,0.05)",position:"relative"}}>
                {!e.read && <div style={{position:"absolute",top:16,right:16,width:8,height:8,background:T.green,borderRadius:"50%"}}/>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
                  <div>
                    <div style={{fontWeight:800,fontSize:14,color:T.text}}>{e.name}</div>
                    <div style={{fontSize:12,color:T.muted}}>📞 {e.phone} · {e.prop}</div>
                    <div style={{fontSize:13,color:"#444",marginTop:6,fontStyle:"italic"}}>"{e.msg}"</div>
                    <div style={{fontSize:11,color:"#bbb",marginTop:4}}>{e.date}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,marginTop:12}}>
                  <button style={{background:T.green,color:"#fff",border:"none",padding:"7px 16px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer"}}>📞 Call Back</button>
                  <button style={{background:T.greenL,color:T.green,border:`1px solid ${T.greenM}`,padding:"7px 16px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer"}}>✉️ Reply</button>
                  <button style={{background:"#f9fafb",color:T.muted,border:`1px solid ${T.border}`,padding:"7px 16px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer"}}>✅ Mark Read</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bookings */}
        {tab==="bookings" && (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {bookingsMock.map(b=>(
              <div key={b.id} style={{background:"#fff",borderRadius:13,padding:"16px 18px",border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
                <div>
                  <div style={{fontWeight:800,fontSize:14,color:T.text}}>{b.name}</div>
                  <div style={{fontSize:12,color:T.muted,marginTop:2}}>🏠 {b.prop}</div>
                  <div style={{fontSize:12,color:T.muted,marginTop:1}}>📅 {b.slot}</div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{background:b.status==="confirmed"?T.greenL:T.redL,color:b.status==="confirmed"?T.green:T.red,padding:"4px 12px",borderRadius:20,fontSize:11,fontWeight:800,border:`1px solid ${b.status==="confirmed"?T.greenM:T.redM}`}}>
                    {b.status==="confirmed"?"✅ Confirmed":"⏳ Pending"}
                  </span>
                  {b.status==="pending" && (
                    <button style={{background:T.green,color:"#fff",border:"none",padding:"6px 14px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer"}}>Confirm ✓</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   PROPERTY CARD
════════════════════════════════════════════════ */
function Card({p, onSelect, onSave}) {
  const [saved, setSaved] = useState(false);
  const [hov,   setHov]   = useState(false);
  const pr = fmtPrice(p.price, p.status);
  const ab = p.status==="for-rent" ? affordBadge(p.price) : null;
  return (
    <div onClick={()=>onSelect(p)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:"#fff",borderRadius:16,overflow:"hidden",cursor:"pointer",display:"flex",flexDirection:"column",
        boxShadow:hov?"0 12px 40px rgba(0,0,0,0.14)":"0 2px 12px rgba(0,0,0,0.07)",
        border:`1px solid ${hov?"#d1d5db":T.border}`,transform:hov?"translateY(-3px)":"none",transition:"all .2s"}}>
      <div style={{position:"relative",height:188,overflow:"hidden",flexShrink:0}}>
        <img src={p.img} alt={p.title} style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform .4s",transform:hov?"scale(1.05)":"scale(1)"}}/>
        <div style={{position:"absolute",top:10,left:10,display:"flex",gap:5}}>
          <span style={{background:p.status==="for-sale"?T.red:T.green,color:"#fff",fontSize:10,fontWeight:800,padding:"3px 9px",borderRadius:20}}>
            {p.status==="for-sale"?"FOR SALE":"FOR RENT"}
          </span>
          {p.featured && <span style={{background:T.gold,color:"#111",fontSize:10,fontWeight:800,padding:"3px 9px",borderRadius:20}}>★ FEATURED</span>}
          {p.status==="for-rent" && <span style={{background:"#16a34a",color:"#fff",fontSize:10,fontWeight:800,padding:"3px 9px",borderRadius:20}}>⚡ NOW</span>}
        </div>
        <button onClick={e=>{e.stopPropagation();setSaved(!saved);onSave&&onSave(p);}} style={{
          position:"absolute",top:10,right:10,background:saved?T.red:"rgba(255,255,255,0.92)",
          border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:14,
          display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.18)"}}>
          {saved?"❤️":"🤍"}
        </button>
        <div style={{position:"absolute",bottom:8,left:10,right:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          {ab && <span style={{background:ab.bg,color:ab.c,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:8}}>{ab.text}</span>}
          <span style={{background:"rgba(0,0,0,0.5)",color:"#fff",fontSize:10,padding:"2px 8px",borderRadius:8,marginLeft:"auto"}}>{p.age===1?"Today":`${p.age}d ago`}</span>
        </div>
      </div>
      <div style={{padding:"13px 15px 15px",display:"flex",flexDirection:"column",flex:1}}>
        <div style={{display:"flex",alignItems:"baseline",gap:3,marginBottom:2}}>
          <span style={{fontSize:20,fontWeight:900,color:T.red,fontFamily:"'Playfair Display',serif"}}>{pr.main}</span>
          {pr.sub && <span style={{fontSize:11,color:T.muted}}>{pr.sub}</span>}
        </div>
        <div style={{fontSize:13,fontWeight:700,color:T.text,lineHeight:1.3,marginBottom:4}}>{p.title}</div>
        <div style={{fontSize:11,color:T.muted,marginBottom:8,display:"flex",alignItems:"center",gap:3}}>
          <span style={{color:T.red}}>📍</span>{p.location}
        </div>
        {p.status==="for-rent" && (
          <div style={{display:"flex",gap:5,marginBottom:8,flexWrap:"wrap"}}>
            {p.petFriendly && <span style={{fontSize:10,background:"#f0fdf4",color:"#166534",padding:"2px 6px",borderRadius:7,fontWeight:700}}>🐾 Pets OK</span>}
            {p.flatmate    && <span style={{fontSize:10,background:"#eff6ff",color:"#1d4ed8",padding:"2px 6px",borderRadius:7,fontWeight:700}}>👥 Flatmate</span>}
            {p.inspSlots?.length>0 && <span style={{fontSize:10,background:"#fef9c3",color:"#854d0e",padding:"2px 6px",borderRadius:7,fontWeight:700}}>📅 {p.inspSlots.length} slot{p.inspSlots.length>1?"s":""}</span>}
          </div>
        )}
        <div style={{display:"flex",gap:10,paddingTop:9,borderTop:`1px solid ${T.border}`,marginBottom:9}}>
          {p.beds>0  && <span style={{fontSize:11,color:"#555"}}>🛏 {p.beds}</span>}
          {p.baths>0 && <span style={{fontSize:11,color:"#555"}}>🚿 {p.baths}</span>}
          {p.cars>0  && <span style={{fontSize:11,color:"#555"}}>🚗 {p.cars}</span>}
          {p.floor>0 && <span style={{fontSize:11,color:"#555"}}>🏢 F{p.floor}</span>}
          <span style={{fontSize:11,color:"#555",marginLeft:"auto"}}>📐 {p.area.toLocaleString()}</span>
        </div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:9}}>
          {p.tags.slice(0,3).map(tag=>(
            <span key={tag} style={{background:T.redL,color:T.red,fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:9,border:`1px solid ${T.redM}`}}>{tag}</span>
          ))}
        </div>
        <div style={{marginTop:"auto",paddingTop:8,borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:10,color:T.muted}}>🏢 {p.agent}</span>
          <span style={{fontSize:10,fontWeight:700,color:T.green}}>{p.phone}</span>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   DETAIL MODAL
════════════════════════════════════════════════ */
function DetailModal({p, onClose, L}) {
  const [tab,          setTab]          = useState("overview");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [booked,       setBooked]       = useState(false);
  const [msgSent,      setMsgSent]      = useState(false);
  const [msg, setMsg] = useState({name:"",phone:"",email:"",subject:"",prefDate:"",prefTime:"Anytime",body:""});
  if (!p) return null;
  const pr = fmtPrice(p.price, p.status);
  const upd = (k,v) => setMsg(m=>({...m,[k]:v}));
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",padding:12,overflowY:"auto"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:700,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 24px 80px rgba(0,0,0,0.3)",margin:"auto"}}>
        <div style={{position:"relative"}}>
          <img src={p.img} alt={p.title} style={{width:"100%",height:260,objectFit:"cover",borderRadius:"20px 20px 0 0"}}/>
          <button onClick={onClose} style={{position:"absolute",top:14,right:14,background:"#fff",border:"none",borderRadius:"50%",width:36,height:36,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 10px rgba(0,0,0,.25)"}}>✕</button>
          <div style={{position:"absolute",bottom:12,left:14,display:"flex",gap:6}}>
            <span style={{background:p.status==="for-sale"?T.red:T.green,color:"#fff",fontSize:11,fontWeight:800,padding:"4px 12px",borderRadius:20}}>{p.status==="for-sale"?"FOR SALE":"FOR RENT"}</span>
            {p.featured && <span style={{background:T.gold,color:"#111",fontSize:11,fontWeight:800,padding:"4px 12px",borderRadius:20}}>★ FEATURED</span>}
          </div>
        </div>
        <div style={{padding:"20px 24px 26px"}}>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:26,fontWeight:900,color:T.red,fontFamily:"'Playfair Display',serif",lineHeight:1}}>{pr.main}<span style={{fontSize:14,color:T.muted,fontWeight:500}}>{pr.sub}</span></div>
            <div style={{fontSize:16,fontWeight:700,color:T.text,marginTop:5}}>{p.title}</div>
            <div style={{color:T.muted,fontSize:12,marginTop:3}}>📍 {p.location} · {p.division}</div>
          </div>
          <div style={{display:"flex",borderBottom:`2px solid ${T.border}`,marginBottom:16,gap:0,overflowX:"auto"}}>
            {[[L.overviewTab,"overview"],[L.utilTab,"utils"],[L.msgTab,"message"],[L.inspTab,"inspect"]].map(([label,val])=>(
              <button key={val} onClick={()=>setTab(val)} style={{padding:"8px 14px",border:"none",background:"transparent",cursor:"pointer",fontWeight:700,fontSize:12,whiteSpace:"nowrap",color:tab===val?T.red:T.muted,borderBottom:tab===val?`2.5px solid ${T.red}`:"2.5px solid transparent",marginBottom:-2}}>
                {label}
              </button>
            ))}
          </div>
          {tab==="overview" && (
            <>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,background:T.border,borderRadius:12,overflow:"hidden",marginBottom:14}}>
                {[p.beds>0&&["🛏",p.beds,"Bedrooms"],p.baths>0&&["🚿",p.baths,"Bathrooms"],p.cars>0&&["🚗",p.cars,"Carspaces"],["📐",`${p.area.toLocaleString()}`,"sq ft"]].filter(Boolean).map(([icon,val,label])=>(
                  <div key={label} style={{background:"#fff",textAlign:"center",padding:"12px 4px"}}>
                    <div style={{fontSize:18}}>{icon}</div>
                    <div style={{fontWeight:800,fontSize:14,color:T.text}}>{val}</div>
                    <div style={{fontSize:10,color:T.muted}}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
                {p.tags.map(tag=><span key={tag} style={{background:T.redL,color:T.red,fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:10,border:`1px solid ${T.redM}`}}>{tag}</span>)}
                {p.petFriendly && <span style={{background:"#f0fdf4",color:"#166534",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:10,border:"1px solid #bbf7d0"}}>🐾 Pet Friendly</span>}
                {p.flatmate    && <span style={{background:"#eff6ff",color:"#1d4ed8",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:10,border:"1px solid #bfdbfe"}}>👥 Flatmate OK</span>}
              </div>
              <div style={{background:T.bg,borderRadius:11,padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:40,height:40,background:T.green,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:16}}>{p.agent[0]}</div>
                  <div><div style={{fontWeight:700,fontSize:13}}>{p.agent}</div><div style={{fontSize:11,color:T.muted}}>Listed {p.age===1?"today":`${p.age} days ago`}</div></div>
                </div>
                <div style={{fontWeight:700,color:T.green,fontSize:13}}>{p.phone}</div>
              </div>
            </>
          )}
          {tab==="utils" && (
            <div>
              {p.utilities.length>0 ? (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
                  {p.utilities.map(u=>(
                    <div key={u} style={{background:T.greenL,border:`1px solid ${T.greenM}`,borderRadius:10,padding:"10px 13px",display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:16}}>✅</span>
                      <span style={{fontWeight:600,fontSize:13,color:T.green}}>{u} Included</span>
                    </div>
                  ))}
                </div>
              ) : <div style={{color:T.muted,fontSize:14,padding:"20px 0",textAlign:"center"}}>No utilities included.</div>}
            </div>
          )}
          {tab==="message" && (
            <div>
              {msgSent ? (
                <div style={{background:T.greenL,border:`1px solid ${T.greenM}`,borderRadius:14,padding:"28px",textAlign:"center"}}>
                  <div style={{fontSize:40,marginBottom:10}}>✅</div>
                  <div style={{fontWeight:800,fontSize:16,color:T.green,marginBottom:6}}>Message Sent!</div>
                  <div style={{fontSize:12,color:T.muted}}>The owner <strong>{p.agent}</strong> will reply within 24 hours.</div>
                </div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <input value={msg.name} onChange={e=>upd("name",e.target.value)} placeholder="Your full name *" style={{padding:"10px 12px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,outline:"none"}}/>
                    <input value={msg.phone} onChange={e=>upd("phone",e.target.value)} placeholder="Your phone *" style={{padding:"10px 12px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,outline:"none"}}/>
                  </div>
                  <input value={msg.email} onChange={e=>upd("email",e.target.value)} placeholder="Email (optional)" style={{padding:"10px 12px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,outline:"none"}}/>
                  <select value={msg.subject} onChange={e=>upd("subject",e.target.value)} style={{padding:"10px 12px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,color:"#444",background:"#fff",outline:"none"}}>
                    {["I'd like to schedule an inspection","Question about this property","Rental application","Other"].map(o=><option key={o}>{o}</option>)}
                  </select>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <input type="date" value={msg.prefDate} onChange={e=>upd("prefDate",e.target.value)} style={{padding:"10px 12px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,outline:"none"}}/>
                    <select value={msg.prefTime} onChange={e=>upd("prefTime",e.target.value)} style={{padding:"10px 12px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,color:"#444",background:"#fff",outline:"none"}}>
                      {["Morning (8am–12pm)","Afternoon (12pm–5pm)","Evening (5pm–8pm)","Anytime"].map(o=><option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <textarea rows={3} value={msg.body} onChange={e=>upd("body",e.target.value)} placeholder="Your message…"
                    style={{padding:"10px 12px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,outline:"none",resize:"vertical",fontFamily:"inherit"}}/>
                  <button onClick={()=>{if(msg.name&&msg.phone)setMsgSent(true);}}
                    style={{background:T.red,color:"#fff",border:"none",padding:"13px",borderRadius:11,fontWeight:800,fontSize:14,cursor:"pointer"}}>
                    📤 Send Message to Owner
                  </button>
                </div>
              )}
            </div>
          )}
          {tab==="inspect" && (
            <div>
              {booked ? (
                <div style={{background:T.greenL,border:`1px solid ${T.greenM}`,borderRadius:14,padding:"28px",textAlign:"center"}}>
                  <div style={{fontSize:40,marginBottom:10}}>🎉</div>
                  <div style={{fontWeight:800,fontSize:16,color:T.green,marginBottom:4}}>Inspection Booked!</div>
                  <div style={{fontSize:12,color:T.muted}}>Time: <strong>{selectedSlot}</strong></div>
                  <div style={{fontSize:12,color:T.muted,marginTop:2}}>Agent: {p.agent} · {p.phone}</div>
                </div>
              ) : (
                <>
                  <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>Book an Inspection</div>
                  <div style={{fontSize:12,color:T.muted,marginBottom:14}}>Pick a slot — the owner will confirm your visit.</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
                    {p.inspSlots.map(slot=>(
                      <button key={slot} onClick={()=>setSelectedSlot(slot)} style={{
                        padding:"12px 15px",borderRadius:11,border:"2px solid",textAlign:"left",cursor:"pointer",
                        display:"flex",alignItems:"center",justifyContent:"space-between",
                        borderColor:selectedSlot===slot?T.green:T.border,background:selectedSlot===slot?T.greenL:"#fff"}}>
                        <span style={{fontSize:13,fontWeight:700,color:selectedSlot===slot?T.green:T.text}}>📅 {slot}</span>
                        <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${selectedSlot===slot?T.green:T.border}`,background:selectedSlot===slot?T.green:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          {selectedSlot===slot && <div style={{width:7,height:7,borderRadius:"50%",background:"#fff"}}/>}
                        </div>
                      </button>
                    ))}
                  </div>
                  <button onClick={()=>{if(selectedSlot)setBooked(true);}} disabled={!selectedSlot}
                    style={{width:"100%",background:selectedSlot?T.green:"#d1d5db",color:"#fff",border:"none",padding:"13px",borderRadius:11,fontWeight:800,fontSize:14,cursor:"pointer"}}>
                    ✅ Confirm Booking
                  </button>
                  <div style={{marginTop:10,fontSize:12,color:T.muted,textAlign:"center"}}>Or call directly: <strong style={{color:T.green}}>{p.phone}</strong></div>
                </>
              )}
            </div>
          )}
          <div style={{display:"flex",gap:9,marginTop:18}}>
            <button onClick={()=>setTab("message")} style={{flex:1,background:T.red,color:"#fff",border:"none",padding:"12px",borderRadius:11,fontWeight:800,fontSize:13,cursor:"pointer"}}>{L.enquireBtn}</button>
            <button style={{flex:1,background:T.green,color:"#fff",border:"none",padding:"12px",borderRadius:11,fontWeight:800,fontSize:13,cursor:"pointer"}}>{L.callBtn} {p.phone}</button>
            <button onClick={()=>setTab("inspect")} style={{background:T.greenL,color:T.green,border:`2px solid ${T.green}`,padding:"12px 13px",borderRadius:11,fontWeight:800,fontSize:13,cursor:"pointer",whiteSpace:"nowrap"}}>{L.inspectBtn}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   LISTING WIZARD (simplified for space)
════════════════════════════════════════════════ */
function ListWizard({onClose}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({type:"apartment",status:"for-rent",title:"",address:"",division:"Dhaka",price:"",beds:"",baths:"",area:"",floor:"",furnished:"unfurnished",avail:"now",availDate:"",inspSlots:[{day:"",time:""}],utils:[],petFriendly:false,flatmate:false,features:[],desc:"",name:"",phone:""});
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));
  const toggleArr = (k,v) => setForm(f=>({...f,[k]:f[k].includes(v)?f[k].filter(x=>x!==v):[...f[k],v]}));
  const addSlot = () => setForm(f=>({...f,inspSlots:[...f.inspSlots,{day:"",time:""}]}));
  const removeSlot = i => setForm(f=>({...f,inspSlots:f.inspSlots.filter((_,idx)=>idx!==i)}));
  const updSlot = (i,k,v) => setForm(f=>({...f,inspSlots:f.inspSlots.map((s,idx)=>idx===i?{...s,[k]:v}:s)}));
  const STEPS = ["Property Type","Location & Details","Rental Terms & Inspection","Features","Contact & Publish"];
  const pct = (step/(STEPS.length-1))*100;

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:4000,display:"flex",alignItems:"center",justifyContent:"center",padding:12,overflowY:"auto"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:22,width:"100%",maxWidth:600,maxHeight:"95vh",overflowY:"auto",boxShadow:"0 24px 80px rgba(0,0,0,0.35)",margin:"auto"}}>
        <div style={{background:`linear-gradient(135deg,${T.green},#0a3d22)`,padding:"20px 24px",borderRadius:"22px 22px 0 0",position:"relative"}}>
          <button onClick={onClose} style={{position:"absolute",top:14,right:14,background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:32,height:32,color:"#fff",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          <div style={{color:"#fff"}}>
            <div style={{fontSize:9,letterSpacing:2,fontWeight:800,opacity:.75,marginBottom:3}}>LIST YOUR PROPERTY — FREE</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:900}}>Step {step+1} of {STEPS.length}: {STEPS[step]}</div>
          </div>
          <div style={{marginTop:12,background:"rgba(255,255,255,0.2)",borderRadius:10,height:5}}>
            <div style={{background:T.gold,height:5,borderRadius:10,width:`${pct}%`,transition:"width .3s"}}/>
          </div>
        </div>
        <div style={{padding:"22px 24px 24px"}}>
          {step===0 && (
            <div>
              <div style={{fontSize:11,fontWeight:800,color:T.muted,letterSpacing:.6,marginBottom:10}}>PROPERTY TYPE</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:18}}>
                {[["🏢","Apartment","apartment"],["🏠","House","house"],["🛏","Single Room","room"],["🏭","Commercial","commercial"],["🌿","Land / Plot","land"]].map(([icon,label,val])=>(
                  <button key={val} onClick={()=>upd("type",val)} style={{padding:"13px",border:"2px solid",cursor:"pointer",borderRadius:12,display:"flex",flexDirection:"column",alignItems:"center",gap:5,borderColor:form.type===val?T.green:T.border,background:form.type===val?T.greenL:"#fff"}}>
                    <span style={{fontSize:24}}>{icon}</span>
                    <span style={{fontSize:12,fontWeight:700,color:form.type===val?T.green:T.text}}>{label}</span>
                  </button>
                ))}
              </div>
              <div style={{fontSize:11,fontWeight:800,color:T.muted,letterSpacing:.6,marginBottom:10}}>LISTING PURPOSE</div>
              <div style={{display:"flex",gap:9}}>
                {[["🔑 For Rent","for-rent","green"],["🏷 For Sale","for-sale","red"]].map(([label,val,color])=>{
                  const active=form.status===val; const bc=color==="red"?T.red:T.green; const bl=color==="red"?T.redL:T.greenL;
                  return <button key={val} onClick={()=>upd("status",val)} style={{flex:1,padding:"11px",border:"2px solid",borderRadius:11,cursor:"pointer",fontWeight:700,fontSize:13,borderColor:active?bc:T.border,background:active?bl:"#fff",color:active?bc:T.text}}>{label}</button>;
                })}
              </div>
            </div>
          )}
          {step===1 && (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {[["PROPERTY TITLE *","title","text","e.g. Spacious 3-Bed Flat in Bashundhara R/A"],["FULL ADDRESS *","address","text","House no, Road no, Area, City"]].map(([label,key,type,ph])=>(
                <div key={key}>
                  <div style={{fontSize:11,fontWeight:800,color:T.muted,marginBottom:4}}>{label}</div>
                  <input value={form[key]} onChange={e=>upd(key,e.target.value)} type={type} placeholder={ph} style={{width:"100%",padding:"10px 12px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                </div>
              ))}
              <div>
                <div style={{fontSize:11,fontWeight:800,color:T.muted,marginBottom:4}}>DIVISION</div>
                <select value={form.division} onChange={e=>upd("division",e.target.value)} style={{width:"100%",padding:"10px 12px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,color:"#444",background:"#fff",outline:"none"}}>
                  {DIVISIONS.slice(1).map(d=><option key={d}>{d}</option>)}
                </select>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:9}}>
                {[["🛏 BEDS","beds"],["🚿 BATHS","baths"],["📐 SQFT","area"],["🏢 FLOOR","floor"]].map(([label,key])=>(
                  <div key={key}><div style={{fontSize:10,fontWeight:800,color:T.muted,marginBottom:4}}>{label}</div><input type="number" value={form[key]} onChange={e=>upd(key,e.target.value)} placeholder="0" style={{width:"100%",padding:"10px 8px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,outline:"none",boxSizing:"border-box"}}/></div>
                ))}
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:800,color:T.muted,marginBottom:4}}>{form.status==="for-rent"?"MONTHLY RENT (৳) *":"ASKING PRICE (৳) *"}</div>
                <input type="number" value={form.price} onChange={e=>upd("price",e.target.value)} placeholder="e.g. 25000" style={{width:"100%",padding:"10px 12px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
            </div>
          )}
          {step===2 && (
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div>
                <div style={{fontSize:11,fontWeight:800,color:T.muted,marginBottom:8}}>FURNISHING STATUS</div>
                <div style={{display:"flex",gap:8}}>
                  {[["Unfurnished","unfurnished"],["Semi-Furnished","semi"],["Fully Furnished","full"]].map(([label,val])=>{
                    const active=form.furnished===val;
                    return <button key={val} onClick={()=>upd("furnished",val)} style={{flex:1,padding:"9px 4px",border:"2px solid",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:11,borderColor:active?T.green:T.border,background:active?T.greenL:"#fff",color:active?T.green:T.text}}>{label}</button>;
                  })}
                </div>
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:800,color:T.muted,marginBottom:8}}>AVAILABILITY</div>
                <div style={{display:"flex",gap:8,marginBottom:8}}>
                  {[["⚡ Available Now","now"],["📅 Specific Date","date"]].map(([label,val])=>{
                    const active=form.avail===val;
                    return <button key={val} onClick={()=>upd("avail",val)} style={{flex:1,padding:"9px",border:"2px solid",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:12,borderColor:active?T.red:T.border,background:active?T.redL:"#fff",color:active?T.red:T.text}}>{label}</button>;
                  })}
                </div>
                {form.avail==="date" && <input type="date" value={form.availDate} onChange={e=>upd("availDate",e.target.value)} style={{width:"100%",padding:"10px 12px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,outline:"none",boxSizing:"border-box"}}/>}
              </div>
              <div style={{background:T.greenL,border:`1.5px solid ${T.greenM}`,borderRadius:13,padding:"14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div>
                    <div style={{fontWeight:800,fontSize:13,color:T.green}}>📅 Inspection Times</div>
                    <div style={{fontSize:11,color:"#4d7a5f",marginTop:2}}>Add times tenants can visit the property</div>
                  </div>
                  <button onClick={addSlot} style={{background:T.green,color:"#fff",border:"none",padding:"5px 11px",borderRadius:18,fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>+ Add Slot</button>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:7}}>
                  {form.inspSlots.map((slot,i)=>(
                    <div key={i} style={{display:"flex",gap:7,alignItems:"center"}}>
                      <input value={slot.day} onChange={e=>updSlot(i,"day",e.target.value)} placeholder="e.g. Friday 30 May 2026" style={{flex:2,padding:"8px 10px",border:`1.5px solid ${T.greenM}`,borderRadius:8,fontSize:12,outline:"none",background:"#fff"}}/>
                      <input value={slot.time} onChange={e=>updSlot(i,"time",e.target.value)} placeholder="e.g. 10:00 AM" style={{flex:1,padding:"8px 10px",border:`1.5px solid ${T.greenM}`,borderRadius:8,fontSize:12,outline:"none",background:"#fff"}}/>
                      {form.inspSlots.length>1 && <button onClick={()=>removeSlot(i)} style={{background:T.redL,color:T.red,border:"none",borderRadius:"50%",width:26,height:26,cursor:"pointer",fontWeight:800,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>}
                    </div>
                  ))}
                </div>
                {form.inspSlots.some(s=>s.day) && <div style={{marginTop:9,fontSize:11,color:T.green,fontWeight:600}}>✅ {form.inspSlots.filter(s=>s.day).length} slot{form.inspSlots.filter(s=>s.day).length>1?"s":""} added</div>}
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:800,color:T.muted,marginBottom:8}}>UTILITIES INCLUDED IN RENT</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {["Gas","Water","Electricity","WiFi","Generator","AC","Lift","Security","Parking"].map(u=>{
                    const active=form.utils.includes(u);
                    return <button key={u} onClick={()=>toggleArr("utils",u)} style={{padding:"5px 12px",border:"1.5px solid",borderRadius:18,cursor:"pointer",fontSize:12,fontWeight:700,borderColor:active?T.green:T.border,background:active?T.greenL:"#fff",color:active?T.green:"#555"}}>{u}</button>;
                  })}
                </div>
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:800,color:T.muted,marginBottom:8}}>TENANT PREFERENCES</div>
                <div style={{display:"flex",gap:9}}>
                  {[["🐾 Pets Allowed","petFriendly"],["👥 Flatmates OK","flatmate"]].map(([label,key])=>{
                    const active=form[key];
                    return <button key={key} onClick={()=>upd(key,!form[key])} style={{flex:1,padding:"10px",border:"2px solid",borderRadius:11,cursor:"pointer",fontWeight:700,fontSize:12,borderColor:active?T.green:T.border,background:active?T.greenL:"#fff",color:active?T.green:T.text}}>{label}</button>;
                  })}
                </div>
              </div>
            </div>
          )}
          {step===3 && (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <div style={{fontSize:11,fontWeight:800,color:T.muted,marginBottom:8}}>PROPERTY HIGHLIGHTS</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {["Corner Unit","Top Floor","Lake View","Sea View","Garden","Pool","Gym","Rooftop","Elevator","24hr Security","CCTV","Prayer Room","School Nearby","Hospital Nearby"].map(f=>{
                    const active=form.features.includes(f);
                    return <button key={f} onClick={()=>toggleArr("features",f)} style={{padding:"6px 12px",border:"1.5px solid",borderRadius:20,cursor:"pointer",fontSize:12,fontWeight:700,borderColor:active?T.red:T.border,background:active?T.redL:"#fff",color:active?T.red:"#555"}}>{f}</button>;
                  })}
                </div>
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:800,color:T.muted,marginBottom:4}}>DESCRIPTION (optional)</div>
                <textarea rows={4} value={form.desc} onChange={e=>upd("desc",e.target.value)} placeholder="Describe your property — nearby landmarks, special features, house rules…" style={{width:"100%",padding:"10px 12px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"inherit"}}/>
              </div>
              <div style={{border:`2px dashed ${T.border}`,borderRadius:12,padding:"24px",textAlign:"center",cursor:"pointer",color:T.muted,fontSize:13}}>
                📷 Click to add photos (up to 10)
              </div>
              {form.price && <div style={{background:T.greenL,border:`1px solid ${T.greenM}`,borderRadius:11,padding:"11px 13px",fontSize:12,color:T.green,fontWeight:600}}>
                👁 Preview: <strong>{form.title||"Your Property"}</strong> · ৳{Number(form.price||0).toLocaleString("en-BD")}{form.status==="for-rent"?"/mo":""} · {form.division}
              </div>}
            </div>
          )}
          {step===4 && (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{background:T.redL,border:`1px solid ${T.redM}`,borderRadius:11,padding:"11px 13px",fontSize:13,color:T.red,fontWeight:600}}>
                🎉 Almost done! Add your contact details.
              </div>
              {[["YOUR FULL NAME *","name","text","e.g. Mohammad Hasan"],["YOUR PHONE NUMBER *","phone","text","01X-XXXXXXXX"]].map(([label,key,type,ph])=>(
                <div key={key}>
                  <div style={{fontSize:11,fontWeight:800,color:T.muted,marginBottom:4}}>{label}</div>
                  <input value={form[key]} onChange={e=>upd(key,e.target.value)} type={type} placeholder={ph} style={{width:"100%",padding:"10px 12px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                </div>
              ))}
              <div style={{background:T.greenL,border:`1px solid ${T.greenM}`,borderRadius:11,padding:"13px 15px"}}>
                <div style={{fontWeight:800,fontSize:13,color:T.green,marginBottom:7}}>Your listing summary:</div>
                <div style={{fontSize:12,color:"#374151",lineHeight:2}}>
                  📌 {form.title||"—"}<br/>📍 {form.address||"—"}, {form.division}<br/>
                  💰 ৳{Number(form.price||0).toLocaleString("en-BD")}{form.status==="for-rent"?"/mo":""}<br/>
                  🛏 {form.beds||"?"} Beds · 🚿 {form.baths||"?"} Baths · 📐 {form.area||"?"} sqft<br/>
                  {form.utils.length>0 && <span>⚡ Includes: {form.utils.join(", ")}<br/></span>}
                  {form.inspSlots.filter(s=>s.day).length>0 && <span>📅 {form.inspSlots.filter(s=>s.day).length} inspection slot(s)<br/></span>}
                  {form.petFriendly && <span>🐾 Pets welcome · </span>}
                  {form.flatmate && <span>👥 Flatmate friendly</span>}
                </div>
              </div>
              <button onClick={onClose} style={{background:T.red,color:"#fff",border:"none",padding:"14px",borderRadius:12,fontWeight:900,fontSize:15,cursor:"pointer",marginTop:4}}>
                🚀 Publish My Listing — Free!
              </button>
            </div>
          )}
          {step<4 && (
            <div style={{display:"flex",gap:9,marginTop:20}}>
              {step>0 && <button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:"11px",border:`2px solid ${T.border}`,borderRadius:11,background:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",color:T.muted}}>← Back</button>}
              <button onClick={()=>setStep(s=>s+1)} style={{flex:2,background:T.green,color:"#fff",border:"none",padding:"11px",borderRadius:11,fontWeight:800,fontSize:14,cursor:"pointer"}}>
                Continue → {STEPS[step+1]}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   MAIN APP
════════════════════════════════════════════════ */
export default function App() {
  const [lang,       setLang]       = useState("en");
  const [search,     setSearch]     = useState("");
  const [status,     setStatus]     = useState("all");
  const [typeF,      setTypeF]      = useState("All Types");
  const [divF,       setDivF]       = useState("All Divisions");
  const [activeQ,    setActiveQ]    = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const [sortBy,     setSortBy]     = useState("featured");
  const [budgetMax,  setBudgetMax]  = useState("");
  const [showAdv,    setShowAdv]    = useState(false);
  const [mainTab,    setMainTab]    = useState("tenant");
  // Auth state
  const [authMode,   setAuthMode]   = useState(null); // null | "login" | "register"
  const [currentUser,setCurrentUser]= useState(null); // null = logged out
  const [page,       setPage]       = useState("home"); // home | tenantDash | ownerDash

  const L = LANG[lang];
  const toggleQ = k => setActiveQ(p=>p.includes(k)?p.filter(x=>x!==k):[...p,k]);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setAuthMode(null);
    if (user.role==="owner" || user.role==="agent") setPage("ownerDash");
    else setPage("tenantDash");
  };
  const handleLogout = () => { setCurrentUser(null); setPage("home"); };

  const filtered = PROPERTIES.filter(p=>{
    if(search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.location.toLowerCase().includes(search.toLowerCase())) return false;
    if(status!=="all" && p.status!==status) return false;
    if(typeF!=="All Types" && p.type!==typeF.toLowerCase()) return false;
    if(divF!=="All Divisions" && p.division!==divF) return false;
    if(budgetMax && p.price>Number(budgetMax)) return false;
    if(activeQ.includes("furnished") && !p.tags.some(t=>t.toLowerCase().includes("furnished"))) return false;
    if(activeQ.includes("pet") && !p.petFriendly) return false;
    if(activeQ.includes("flatmate") && !p.flatmate) return false;
    if(activeQ.includes("parking") && p.cars<1) return false;
    if(activeQ.includes("gen") && !p.tags.some(t=>t.includes("Gen")||t.includes("Generator"))) return false;
    if(activeQ.includes("ac") && !p.tags.some(t=>t.includes("AC"))) return false;
    if(activeQ.includes("utilities") && p.utilities.length===0) return false;
    if(activeQ.includes("ground") && p.floor!==1) return false;
    if(activeQ.includes("gym") && !p.tags.some(t=>t.includes("Gym")||t.includes("Pool"))) return false;
    if(activeQ.includes("wifi") && !p.utilities.includes("WiFi")) return false;
    if(activeQ.includes("insp") && (!p.inspSlots||p.inspSlots.length===0)) return false;
    return true;
  }).sort((a,b)=>{
    if(sortBy==="price-asc") return a.price-b.price;
    if(sortBy==="price-desc") return b.price-a.price;
    if(sortBy==="newest") return a.age-b.age;
    return (b.featured?1:0)-(a.featured?1:0);
  });

  const Pill = ({children, active, onClick}) => (
    <button onClick={onClick} style={{padding:"6px 13px",borderRadius:20,border:"1.5px solid",cursor:"pointer",fontWeight:700,fontSize:12,flexShrink:0,transition:"all .15s",borderColor:active?T.red:"#d1d5db",background:active?T.redL:"#fff",color:active?T.red:"#555"}}>
      {children}
    </button>
  );

  // Show dashboards
  if (page==="tenantDash" && currentUser) return <TenantDashboard user={currentUser} onLogout={handleLogout} L={L} lang={lang}/>;
  if (page==="ownerDash"  && currentUser) return <OwnerDashboard  user={currentUser} onLogout={handleLogout} L={L} onNewListing={()=>setShowWizard(true)}/>;

  return (
    <div style={{fontFamily:"'DM Sans','Segoe UI',sans-serif",minHeight:"100vh",background:T.bg,color:T.text}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>

      {/* TOP BAR */}
      <div style={{background:T.green,color:"#fff",fontSize:11,padding:"4px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>{L.topBar}</span>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <span onClick={()=>setAuthMode("login")} style={{cursor:"pointer",opacity:.85}}>{L.signIn}</span>
          <span onClick={()=>setAuthMode("register")} style={{cursor:"pointer",opacity:.85}}>{L.register}</span>
          <span onClick={()=>setAuthMode("register")} style={{cursor:"pointer",opacity:.85}}>{L.agentLogin}</span>
          <button onClick={()=>setLang(l=>l==="en"?"bn":"en")} style={{
            background:"rgba(255,255,255,0.2)",border:"1.5px solid rgba(255,255,255,0.6)",
            borderRadius:14,padding:"3px 11px",color:"#fff",fontSize:11,fontWeight:800,
            cursor:"pointer",marginLeft:4
          }}>{L.langBtn}</button>
        </div>
      </div>

      {/* HEADER */}
      <header style={{background:"#fff",borderBottom:`1px solid ${T.border}`,padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:60,position:"sticky",top:0,zIndex:500,boxShadow:"0 1px 8px rgba(0,0,0,0.07)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,userSelect:"none"}}>
          <div style={{background:`linear-gradient(135deg,${T.red},#a00d24)`,borderRadius:9,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🏠</div>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontWeight:900,fontSize:18,color:T.text,lineHeight:1}}>Basha<span style={{color:T.red}}>BD</span></div>
            <div style={{fontSize:8,letterSpacing:1.5,color:T.green,fontWeight:700,marginTop:1}}>FIND · RENT · LIST</div>
          </div>
        </div>
        <nav style={{display:"flex",gap:1}}>
          {["🔍 Listings","💰 Calculator","👨‍💼 Agents","🗺 Map"].map(label=>(
            <button key={label} style={{padding:"5px 12px",border:"none",background:"transparent",cursor:"pointer",fontWeight:600,fontSize:12,color:T.muted}}>{label}</button>
          ))}
        </nav>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {currentUser ? (
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <button onClick={()=>setPage(currentUser.role==="owner"||currentUser.role==="agent"?"ownerDash":"tenantDash")}
                style={{display:"flex",alignItems:"center",gap:7,background:T.greenL,border:`1px solid ${T.greenM}`,borderRadius:20,padding:"6px 14px",cursor:"pointer",fontWeight:700,fontSize:12,color:T.green}}>
                <div style={{width:24,height:24,background:T.green,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,fontWeight:900}}>{currentUser.name?.[0]||"U"}</div>
                {currentUser.name?.split(" ")[0]}
              </button>
            </div>
          ) : (
            <button onClick={()=>setAuthMode("login")} style={{background:"#fff",color:T.red,border:`2px solid ${T.red}`,padding:"7px 16px",borderRadius:20,fontWeight:800,fontSize:12,cursor:"pointer"}}>
              {L.signIn}
            </button>
          )}
          <button onClick={()=>setShowWizard(true)} style={{background:T.red,color:"#fff",border:"none",padding:"9px 18px",borderRadius:20,fontWeight:800,fontSize:12,cursor:"pointer",boxShadow:"0 2px 10px rgba(200,16,46,0.3)"}}>
            {L.listBtn}
          </button>
        </div>
      </header>

      {/* HERO */}
      <div style={{background:"linear-gradient(160deg,#fff 0%,#fff8f8 45%,#f0faf4 100%)",borderBottom:`1px solid ${T.border}`,padding:"32px 20px 40px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-70,right:-70,width:240,height:240,background:"rgba(200,16,46,0.05)",borderRadius:"50%"}}/>
        <div style={{position:"absolute",bottom:-50,left:-50,width:200,height:200,background:"rgba(26,107,60,0.06)",borderRadius:"50%"}}/>
        <div style={{position:"relative",textAlign:"center"}}>
          <div style={{display:"inline-flex",background:"#f1f3f5",borderRadius:13,padding:4,marginBottom:22,gap:3}}>
            <button onClick={()=>{setMainTab("tenant");setStatus("for-rent");}} style={{padding:"9px 22px",borderRadius:9,border:"none",cursor:"pointer",fontWeight:800,fontSize:13,transition:"all .2s",background:mainTab==="tenant"?T.red:"transparent",color:mainTab==="tenant"?"#fff":"#666",boxShadow:mainTab==="tenant"?"0 2px 10px rgba(200,16,46,0.25)":"none"}}>
              {L.tenantMode}
            </button>
            <button onClick={()=>setMainTab("owner")} style={{padding:"9px 22px",borderRadius:9,border:"none",cursor:"pointer",fontWeight:800,fontSize:13,transition:"all .2s",background:mainTab==="owner"?T.green:"transparent",color:mainTab==="owner"?"#fff":"#666",boxShadow:mainTab==="owner"?"0 2px 10px rgba(26,107,60,0.25)":"none"}}>
              {L.ownerMode}
            </button>
          </div>

          {mainTab==="owner" ? (
            <div>
              <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:900,margin:"0 0 10px",color:T.text,lineHeight:1.1}}>
                {L.heroO1}<br/><span style={{color:T.green}}>{L.heroO2}</span>
              </h1>
              <p style={{fontSize:14,color:T.muted,marginBottom:24}}>{L.heroOSub}</p>
              <div style={{display:"flex",justifyContent:"center",gap:12,marginBottom:26,flexWrap:"wrap"}}>
                {["✅ 100% Free","⚡ Live in Minutes","📞 Direct Contact","📅 Inspection Times","🔒 Verified Tenants"].map(t=>(
                  <div key={t} style={{background:"#fff",border:`1px solid ${T.border}`,borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:700,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>{t}</div>
                ))}
              </div>
              <button onClick={()=>currentUser?setShowWizard(true):setAuthMode("register")} style={{background:T.green,color:"#fff",border:"none",padding:"15px 44px",borderRadius:13,fontWeight:900,fontSize:16,cursor:"pointer",boxShadow:"0 4px 20px rgba(26,107,60,0.3)"}}>
                {L.startFree}
              </button>
            </div>
          ) : (
            <div>
              <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:900,margin:"0 0 10px",color:T.text,lineHeight:1.1}}>
                {L.heroT1} <span style={{color:T.red}}>{L.heroT2}</span>
              </h1>
              <p style={{fontSize:14,color:T.muted,marginBottom:24}}>{L.heroTSub}</p>
              <div style={{background:"#fff",borderRadius:16,padding:"18px 20px",maxWidth:860,margin:"0 auto",boxShadow:"0 6px 40px rgba(0,0,0,0.1)",border:`1px solid ${T.border}`}}>
                <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
                  {[["🔑 Rent","for-rent"],["🏢 Buy","for-sale"],["📊 All","all"]].map(([label,val])=>(
                    <button key={val} onClick={()=>setStatus(val)} style={{padding:"6px 14px",borderRadius:8,border:"1.5px solid",cursor:"pointer",fontWeight:700,fontSize:12,borderColor:status===val?T.red:T.border,background:status===val?T.red:"#fff",color:status===val?"#fff":"#555"}}>
                      {label}
                    </button>
                  ))}
                  <button onClick={()=>setShowAdv(!showAdv)} style={{marginLeft:"auto",padding:"6px 13px",border:`1.5px solid ${T.border}`,borderRadius:8,background:"#fff",cursor:"pointer",fontSize:12,fontWeight:600,color:T.muted}}>{L.filtersBtn} {showAdv?"▲":"▼"}</button>
                </div>
                <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={L.searchPh}
                    style={{flex:"2 1 180px",padding:"11px 14px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,outline:"none"}}/>
                  <select value={typeF} onChange={e=>setTypeF(e.target.value)} style={{flex:"1 1 110px",padding:"11px 9px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:12,color:"#444",background:"#fff"}}>
                    {PTYPES.map(p=><option key={p}>{p}</option>)}
                  </select>
                  <select value={divF} onChange={e=>setDivF(e.target.value)} style={{flex:"1 1 120px",padding:"11px 9px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:12,color:"#444",background:"#fff"}}>
                    {DIVISIONS.map(d=><option key={d}>{d}</option>)}
                  </select>
                  <button style={{background:T.red,color:"#fff",border:"none",padding:"11px 22px",borderRadius:9,fontWeight:800,fontSize:14,cursor:"pointer"}}>{L.searchBtn}</button>
                </div>
                {showAdv && (
                  <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid #f0f0f0",display:"flex",gap:9,flexWrap:"wrap",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <span style={{fontSize:12,fontWeight:700,color:T.muted}}>Max ৳/mo:</span>
                      <input type="number" value={budgetMax} onChange={e=>setBudgetMax(e.target.value)} placeholder="e.g. 30000" style={{width:100,padding:"7px 9px",border:`1.5px solid ${T.border}`,borderRadius:8,fontSize:12,outline:"none"}}/>
                    </div>
                    <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{padding:"7px 9px",border:`1.5px solid ${T.border}`,borderRadius:8,fontSize:12,color:"#444",background:"#fff"}}>
                      <option value="featured">Featured First</option><option value="newest">Newest</option>
                      <option value="price-asc">Price ↑</option><option value="price-desc">Price ↓</option>
                    </select>
                    <button onClick={()=>{setSearch("");setStatus("all");setTypeF("All Types");setDivF("All Divisions");setBudgetMax("");setActiveQ([]);}}
                      style={{padding:"7px 12px",border:`1.5px solid ${T.border}`,borderRadius:8,background:"#fff",cursor:"pointer",fontSize:12,fontWeight:600,color:T.muted}}>{L.resetBtn}</button>
                  </div>
                )}
              </div>
            </div>
          )}
          <div style={{display:"flex",justifyContent:"center",gap:32,marginTop:22,flexWrap:"wrap"}}>
            {[["10,800+","Rentals"],["3,200+","Agents"],["8","Divisions"],["⭐ 4.8","Rating"]].map(([num,label])=>(
              <div key={label} style={{textAlign:"center"}}>
                <div style={{fontSize:19,fontWeight:900,color:T.red,fontFamily:"'Playfair Display',serif"}}>{num}</div>
                <div style={{fontSize:11,color:T.muted,fontWeight:500}}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QUICK FILTERS */}
      <div style={{background:"#fff",borderBottom:`1px solid ${T.border}`,padding:"9px 20px",display:"flex",gap:6,overflowX:"auto",whiteSpace:"nowrap",alignItems:"center"}}>
        <span style={{fontSize:10,fontWeight:800,color:T.muted,flexShrink:0,marginRight:3}}>{L.quickLabel}</span>
        {QUICK_FILTERS.map(f=><Pill key={f.key} active={activeQ.includes(f.key)} onClick={()=>toggleQ(f.key)}>{f.label}</Pill>)}
        {activeQ.length>0 && <Pill onClick={()=>setActiveQ([])}>{L.clearAll}</Pill>}
      </div>

      {/* MAIN */}
      <div style={{maxWidth:1220,margin:"0 auto",padding:"24px 18px"}}>
        {mainTab==="owner" && (
          <div style={{marginBottom:32}}>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:21,fontWeight:900,margin:"0 0 16px"}}>How BashaBD Works for Owners</h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:14}}>
              {[["1","📋","Create Your Listing","Fill details, set inspection times, upload photos — under 5 mins"],
                ["2","⚡","Go Live Instantly","Reaches thousands of active renters immediately"],
                ["3","📅","Manage Inspections","Tenants book from your available times — you get notified"],
                ["4","📞","Get Direct Enquiries","Tenants message or call you directly — no middlemen"]].map(([num,icon,title,desc])=>(
                <div key={num} style={{background:"#fff",border:`1px solid ${T.border}`,borderRadius:13,padding:"18px 16px",position:"relative",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
                  <div style={{position:"absolute",top:13,right:13,width:24,height:24,background:T.greenL,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:T.green}}>{num}</div>
                  <div style={{fontSize:26,marginBottom:7}}>{icon}</div>
                  <div style={{fontWeight:800,fontSize:13,color:T.text,marginBottom:4}}>{title}</div>
                  <div style={{fontSize:11,color:T.muted,lineHeight:1.6}}>{desc}</div>
                </div>
              ))}
            </div>
            <div style={{textAlign:"center",marginTop:16}}>
              <button onClick={()=>currentUser?setShowWizard(true):setAuthMode("register")} style={{background:T.green,color:"#fff",border:"none",padding:"12px 34px",borderRadius:11,fontWeight:900,fontSize:14,cursor:"pointer"}}>
                {L.startListBtn}
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:9}}>
          <div>
            <h2 style={{margin:0,fontSize:18,fontWeight:800}}>{filtered.length} Properties{divF!=="All Divisions"?` in ${divF}`:""}</h2>
            <div style={{fontSize:12,color:T.muted,marginTop:2}}>{status==="for-rent"?"Rentals":status==="for-sale"?"For Sale":"All Listings"}</div>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {[["All","all"],["For Rent","for-rent"],["For Sale","for-sale"]].map(([label,val])=>(
              <Pill key={label} active={status===val} onClick={()=>setStatus(val)}>{label}</Pill>
            ))}
          </div>
        </div>

        {filtered.length>0 ? (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:18}}>
            {filtered.map(p=><Card key={p.id} p={p} onSelect={setSelected}/>)}
          </div>
        ) : (
          <div style={{textAlign:"center",padding:"56px 0",color:T.muted}}>
            <div style={{fontSize:48,marginBottom:10}}>🏚</div>
            <div style={{fontSize:17,fontWeight:700}}>{L.noMatch}</div>
            <button onClick={()=>{setSearch("");setActiveQ([]);setBudgetMax("");setStatus("all");}} style={{marginTop:12,background:T.red,color:"#fff",border:"none",padding:"9px 22px",borderRadius:18,fontWeight:700,cursor:"pointer"}}>{L.clearFilters}</button>
          </div>
        )}

        {/* Popular Areas */}
        <div style={{marginTop:44}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:21,fontWeight:900,margin:0}}>{L.browseAreas}</h2>
            <span style={{fontSize:13,color:T.green,fontWeight:700,cursor:"pointer"}}>{L.viewAll}</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8}}>
            {AREAS.map(area=>(
              <button key={area} onClick={()=>setSearch(area)} style={{background:"#fff",border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",cursor:"pointer",textAlign:"left",fontWeight:600,fontSize:13,color:T.text,transition:"all .18s",display:"flex",alignItems:"center",gap:5}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=T.red;e.currentTarget.style.color=T.red;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.text;}}>
                <span style={{color:T.red}}>📍</span>{area}
              </button>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div style={{marginTop:44}}>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:21,fontWeight:900,margin:"0 0 16px"}}>Renting Tips for Bangladesh</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:12}}>
            {[["📄","Verify Ownership","Always ask for Khatian & Porcha documents before signing."],
              ["✍️","Written Rental Deed","A notarised Chukti Patra protects both tenant and owner."],
              ["📅","Book an Inspection","Always visit the property in person before paying any advance."],
              ["🏛","Check RAJUK Approval","Verify RAJUK or CDA building approval for Dhaka properties."]].map(([icon,title,desc])=>(
              <div key={title} style={{background:"#fff",border:`1px solid ${T.border}`,borderRadius:12,padding:"16px 14px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
                <div style={{fontSize:24,marginBottom:7}}>{icon}</div>
                <div style={{fontWeight:800,fontSize:13,color:T.text,marginBottom:4}}>{title}</div>
                <div style={{fontSize:12,color:T.muted,lineHeight:1.6}}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{marginTop:44,background:`linear-gradient(135deg,${T.green},#0a3d22)`,borderRadius:16,padding:"32px 36px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:18,color:"#fff",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",right:-28,top:-28,width:160,height:160,background:"rgba(255,255,255,0.05)",borderRadius:"50%"}}/>
          <div style={{position:"relative"}}>
            <div style={{fontSize:10,letterSpacing:2,fontWeight:700,opacity:.75,marginBottom:5}}>FOR LANDLORDS & PROPERTY OWNERS</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,marginBottom:5}}>List Your Vacant Property Today</div>
            <div style={{opacity:.85,fontSize:13}}>Free listing · Reach 10,000+ active renters · Get direct calls</div>
          </div>
          <button onClick={()=>currentUser?setShowWizard(true):setAuthMode("register")} style={{background:T.gold,color:"#1a2e22",border:"none",padding:"12px 24px",borderRadius:10,fontWeight:900,fontSize:14,cursor:"pointer",position:"relative"}}>
            List Free Now →
          </button>
        </div>
      </div>

      {/* GOVT LINKS */}
      <div style={{background:"#fff",borderTop:`2px solid ${T.border}`,marginTop:32}}>
        <div style={{maxWidth:1220,margin:"0 auto",padding:"12px 18px"}}>
          <div style={{fontSize:10,fontWeight:800,color:"#9ca3af",letterSpacing:1.5,marginBottom:9}}>{L.govTitle}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {GOV_LINKS.map(g=>(
              <a key={g.label} href={g.url} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:4,padding:"5px 11px",background:"#f9fafb",border:`1.5px solid ${T.border}`,borderRadius:18,fontSize:11,fontWeight:700,color:"#374151",textDecoration:"none",transition:"all .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=T.green;e.currentTarget.style.color=T.green;e.currentTarget.style.background=T.greenL;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color="#374151";e.currentTarget.style.background="#f9fafb";}}>
                {g.icon} {g.label} <span style={{fontSize:8,color:"#d1d5db"}}>↗</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{background:"#0f1f16",color:"#6b8f7a",padding:"40px 20px 20px"}}>
        <div style={{maxWidth:1220,margin:"0 auto"}}>
          <div style={{display:"flex",gap:32,flexWrap:"wrap",marginBottom:28}}>
            <div style={{flex:"2 1 200px"}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:9}}>
                <div style={{background:T.red,borderRadius:7,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🏠</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:900,color:"#fff"}}>Basha<span style={{color:T.red}}>BD</span></div>
              </div>
              <p style={{fontSize:12,lineHeight:1.8,color:"#4d7a5f",maxWidth:240}}>Bangladesh's most trusted rental & property portal across all 8 divisions.</p>
            </div>
            {[["For Tenants",["Search Rentals","Buy Property","Book Inspections","Rental Guides","Tenant Rights"]],
              ["For Owners",["List Property Free","Manage Listings","Set Inspection Times","Owner Dashboard"]],
              ["Company",["About BashaBD","Careers","Blog","Contact","Privacy Policy"]]].map(([title,items])=>(
              <div key={title} style={{flex:"1 1 110px"}}>
                <div style={{color:"#fff",fontWeight:700,marginBottom:9,fontSize:13}}>{title}</div>
                {items.map(item=><div key={item} style={{fontSize:11.5,marginBottom:6,cursor:"pointer",color:"#4d7a5f"}}
                  onMouseEnter={e=>e.target.style.color="#fff"} onMouseLeave={e=>e.target.style.color="#4d7a5f"}>{item}</div>)}
              </div>
            ))}
          </div>
          <div style={{borderTop:"1px solid #1a2e22",paddingTop:14,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:9,fontSize:11,color:"#2d5040"}}>
            <span>© 2026 BashaBD Limited. All rights reserved. BTRC Registered.</span>
            <span>🇧🇩 Built for Bangladesh · Dhaka HQ</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <DetailModal p={selected} onClose={()=>setSelected(null)} L={L}/>
      {showWizard && <ListWizard onClose={()=>setShowWizard(false)}/>}
      {authMode && <AuthModal mode={authMode} onClose={()=>setAuthMode(null)} onSuccess={handleAuthSuccess} L={L}/>}
    </div>
  );
}
