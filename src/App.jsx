import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

/* ── SUPABASE CLIENT ─────────────────────────── */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = (SUPABASE_URL && SUPABASE_KEY) ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// Convert a database row -> the property shape the app UI expects
function dbRowToProp(r){
  return {
    id: r.id,
    title: r.title || "Untitled Property",
    titleBn: r.title || "",
    type: r.type || "apartment",
    status: r.status || "for-rent",
    price: Number(r.price) || 0,
    area: Number(r.area_sqft) || 0,
    beds: Number(r.beds) || 0,
    baths: Number(r.baths) || 0,
    cars: Number(r.cars) || 0,
    floor: Number(r.floor_no) || 0,
    location: r.area_name ? (r.area_name + (r.division ? ", " + r.division : "")) : (r.address || r.division || ""),
    division: r.division || "Dhaka",
    img: r.img || (Array.isArray(r.photos) && r.photos[0]) || "",
    photos: Array.isArray(r.photos) ? r.photos.map(u=>({url:u})) : [],
    featured: !!r.featured,
    tags: Array.isArray(r.tags) ? r.tags : [],
    petFriendly: !!r.pet_friendly,
    flatmate: !!r.flatmate_ok,
    utilities: Array.isArray(r.utilities) ? r.utilities : [],
    inspSlots: Array.isArray(r.insp_slots) ? r.insp_slots : [],
    agent: r.agent || "Owner",
    phone: r.phone || "",
    desc: r.description || "",
    age: 0,
    views: Number(r.views) || 0,
    saves: 0,
    ownerId: r.owner_email || "owner1",
    ownerEmail: r.owner_email || "",
    isUserListing: true,
  };
}

// Upload base64/blob photos to Supabase Storage, return array of public URLs
async function uploadPhotos(photos){
  if(!supabase || !Array.isArray(photos) || photos.length===0) return [];
  const urls = [];
  for(let i=0;i<photos.length;i++){
    const ph = photos[i];
    const dataUrl = ph && ph.url ? ph.url : (typeof ph==="string"?ph:null);
    if(!dataUrl) continue;
    // Already a hosted URL (editing an existing listing) — keep as-is
    if(dataUrl.startsWith("http")){ urls.push(dataUrl); continue; }
    try {
      const resp = await fetch(dataUrl);
      const blob = await resp.blob();
      const ext = (blob.type && blob.type.split("/")[1]) || "jpg";
      const path = `listing_${Date.now()}_${i}.${ext}`;
      const { error } = await supabase.storage.from("property-photos").upload(path, blob, { contentType: blob.type || "image/jpeg", upsert: false });
      if(error){ console.error("Photo upload failed:", error.message); continue; }
      const { data } = supabase.storage.from("property-photos").getPublicUrl(path);
      if(data && data.publicUrl) urls.push(data.publicUrl);
    } catch(e){ console.error("Photo processing failed:", e); }
  }
  return urls;
}

// Build a database row from the wizard form + uploaded photo URLs
function formToDbRow(form, photoUrls){
  return {
    title: form.title || "Untitled Property",
    type: form.type || "apartment",
    status: form.status || "for-rent",
    price: Number(form.price) || 0,
    area_sqft: Number(form.area) || 0,
    beds: Number(form.beds) || 0,
    baths: Number(form.baths) || 0,
    floor_no: Number(form.floor) || 0,
    area_name: form.areaName || "",
    address: form.address || "",
    division: form.division || "Dhaka",
    img: photoUrls[form.coverIdx] || photoUrls[0] || "",
    photos: photoUrls,
    tags: [...(form.furnished?[form.furnished.charAt(0).toUpperCase()+form.furnished.slice(1)]:[]), ...((form.features||[]).slice(0,3))],
    pet_friendly: !!form.petFriendly,
    flatmate_ok: !!form.flatmate,
    utilities: form.utils || [],
    insp_slots: (form.inspSlots||[]).filter(x=>x.day&&x.time).map(x=>`${x.day} — ${x.time}`),
    agent: form.name || "Owner",
    phone: form.phone || "",
    description: form.desc || "",
    published: true,
    views: 0,
  };
}


/* ── MOBILE HOOK ─────────────────────────────── */
function useIsMobile() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const handler = () => setW(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return w < 768;
}

const T = {
  red:"#C8102E", redL:"#fdf1f3", redM:"#f5d0d6",
  green:"#1a6b3c", greenL:"#f0faf4", greenM:"#c3e6d0",
  gold:"#F5C842", bg:"#f5f6f8", text:"#111827",
  muted:"#6b7280", border:"#e5e7eb",
};

/* Branded "photo coming soon" placeholder (inline SVG, no network needed) */
const PHOTO_PLACEHOLDER = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#eef1f4"/><g fill="#c3cad3"><rect x="248" y="150" width="104" height="78" rx="8"/><circle cx="278" cy="178" r="11" fill="#eef1f4"/><path d="M256 220l28-30 22 22 18-16 26 24z" fill="#eef1f4"/></g><text x="50%" y="270" font-family="sans-serif" font-size="20" font-weight="600" fill="#9aa3ad" text-anchor="middle">Basha.app · Photo coming soon</text></svg>'
);

/* ── TRANSLATIONS ─────────────────────────────── */
const LANG = {
  en:{
    topBar:"Bangladesh's #1 Rental & Property Portal — 1.2M+ users trust Basha.app",
    signIn:"Sign In", register:"Register", agentLogin:"Agent Login", langBtn:"বাংলা 🇧🇩",
    listBtn:"+ List Property Free",
    tenantMode:"🔍 I'm Looking for Property", ownerMode:"🏠 I Have a Property to List",
    heroT1:"Find Your Next", heroT2:"Property", heroT3:"",
    heroTSub:"Find rentals and properties across all 8 divisions",
    heroO1:"List Your Vacant Property", heroO2:"Reach Renters Directly — Free",
    heroOSub:"Under 5 minutes · No agent fees · Direct tenant contact · Set inspection times",
    startFree:"🚀 Start Free Listing →",
    searchPh:"🔍  Area, road, city… (e.g. Gulshan, Uttara)", searchBtn:"Search",
    filtersBtn:"⚙ Filters", resetBtn:"✕ Reset",
    quickLabel:"QUICK FILTERS:", clearAll:"✕ Clear all",
    browseAreas:"Browse Popular Areas", viewAll:"View all →",
    startListBtn:"📋 Start Listing My Property",
    ctaTitle:"List Your Vacant Property Today", ctaSub:"Free listing · Reach 10,000+ active renters",
    listFreeBtn:"List Free Now →",
    govTitle:"🏛 OFFICIAL GOVERNMENT RESOURCES — BANGLADESH",
    enquireBtn:"✉️ Enquire Now", callBtn:"📞 Call", inspectBtn:"📅 Inspect",
    overviewTab:"🏠 Overview", utilTab:"⚡ Utilities", msgTab:"✉️ Message", inspTab:"📅 Inspections",
    sendMsgBtn:"📤 Send Message", msgSentTitle:"✅ Sent!", confirmBookBtn:"✅ Confirm Booking",
    bookedTitle:"🎉 Booked!", noInspMsg:"No inspection times yet.",
    forRent:"FOR RENT", forSale:"FOR SALE", featured:"★ FEATURED",
    beds:"Beds", baths:"Baths", cars:"Cars", floor:"Floor", sqft:"sqft",
    petsOk:"🐾 Pets OK", flatmate:"👥 Flatmate",
    today:"Today", daysAgo:"d ago",
    budget:"💚 Budget", midRange:"💛 Mid Range", premium:"💎 Premium",
    perMonth:"/mo", crore:"Cr", lac:"Lac",
    confirmed:"✅ Confirmed", pending:"⏳ Pending",
    allDivisions:"All Divisions", allTypes:"All Types",
    rent:"🔑 Rent", buy:"🏢 Buy", all:"📊 All",
    listView:"🏠 List", mapView:"🗺 Map",
    properties:"Properties", rentals:"Rentals", forSaleLbl:"For Sale", allListings:"All Listings",
    noMatch:"No properties match your search", clearFilters:"Clear Filters",
    inspSlots:" slots", inspSlot:" slot",
    viewsLabel:"views", savesLabel:"saves",
    listedToday:"Today", listedDaysAgo:"d ago",
    included:"Included", noUtilities:"No utilities included",
    bookInspection:"Book an Inspection",
    pickSlot:"Pick a slot — the owner/agent will confirm your visit.",
    callDirectly:"Or call directly:",
    listedAgo:"listed",
    howItWorks:"How Basha.app Works for Owners",
    rentingTips:"Property Tips for Bangladesh",
    appsTitle:"Mobile Apps Coming Soon",
    appsSub:"Take Basha.app with you. Our Android and iOS apps are on the way — search, save and book inspections on the go.",
    appsAndroid:"Android App",
    appsIos:"iOS App",
    appsBadge:"Coming Soon",
    verifyOwnership:"Verify Ownership",
    verifyOwnershipDesc:"Always ask for Khatian & Porcha documents before signing.",
    writtenDeed:"Written Rental Deed",
    writtenDeedDesc:"A notarised Chukti Patra protects both tenant and owner.",
    bookInsp:"Book an Inspection",
    bookInspDesc:"Always visit the property in person before paying any advance.",
    checkRajuk:"Check RAJUK Approval",
    checkRajukDesc:"Verify RAJUK or CDA building approval for Dhaka properties.",
  },
  bn:{
    topBar:"বাংলাদেশের #১ ভাড়া ও সম্পত্তি পোর্টাল — ১২ লক্ষ+ ব্যবহারকারী · Basha.app",
    signIn:"সাইন ইন", register:"নিবন্ধন", agentLogin:"এজেন্ট লগইন", langBtn:"English 🇬🇧",
    listBtn:"+ বিনামূল্যে তালিকা দিন",
    tenantMode:"🔍 আমি সম্পত্তি খুঁজছি", ownerMode:"🏠 আমার সম্পত্তি আছে",
    heroT1:"আপনার পরবর্তী", heroT2:"সম্পত্তি খুঁজুন", heroT3:"",
    heroTSub:"সারা বাংলাদেশের ৮ বিভাগে ভাড়া ও সম্পত্তি",
    heroO1:"আপনার খালি সম্পত্তি তালিকা দিন", heroO2:"সরাসরি ভাড়াটিয়ার কাছে পৌঁছান",
    heroOSub:"মাত্র ৫ মিনিটে · কোনো এজেন্ট ফি নেই · সরাসরি যোগাযোগ",
    startFree:"🚀 বিনামূল্যে শুরু করুন →",
    searchPh:"🔍  এলাকা, রাস্তা, শহর…", searchBtn:"খুঁজুন",
    filtersBtn:"⚙ ফিল্টার", resetBtn:"✕ রিসেট",
    quickLabel:"দ্রুত ফিল্টার:", clearAll:"✕ সব মুছুন",
    browseAreas:"জনপ্রিয় এলাকা দেখুন", viewAll:"সব দেখুন →",
    startListBtn:"📋 তালিকা শুরু করুন",
    ctaTitle:"আজই তালিকা দিন", ctaSub:"বিনামূল্যে · ১০,০০০+ ভাড়াটিয়া",
    listFreeBtn:"এখনই বিনামূল্যে →",
    govTitle:"🏛 সরকারি সম্পদ — বাংলাদেশ",
    enquireBtn:"✉️ জিজ্ঞেস করুন", callBtn:"📞 ফোন", inspectBtn:"📅 পরিদর্শন",
    overviewTab:"🏠 বিবরণ", utilTab:"⚡ সুবিধা", msgTab:"✉️ বার্তা", inspTab:"📅 পরিদর্শন",
    sendMsgBtn:"📤 বার্তা পাঠান", msgSentTitle:"✅ পাঠানো হয়েছে!", confirmBookBtn:"✅ বুকিং নিশ্চিত",
    bookedTitle:"🎉 বুক হয়েছে!", noInspMsg:"এখনো কোনো সময় নেই।",
    forRent:"ভাড়া", forSale:"বিক্রয়", featured:"★ ফিচার্ড",
    beds:"শয়নকক্ষ", baths:"বাথরুম", cars:"গাড়ি", floor:"তলা", sqft:"বর্গফুট",
    petsOk:"🐾 পোষা প্রাণী ঠিক আছে", flatmate:"👥 ফ্ল্যাটমেট",
    today:"আজ", daysAgo:"দিন আগে",
    budget:"💚 সাশ্রয়ী", midRange:"💛 মধ্যম", premium:"💎 প্রিমিয়াম",
    perMonth:"/মাস", crore:"কোটি", lac:"লাখ",
    confirmed:"✅ নিশ্চিত", pending:"⏳ অপেক্ষমান",
    allDivisions:"সকল বিভাগ", allTypes:"সকল ধরন",
    rent:"🔑 ভাড়া", buy:"🏢 কিনুন", all:"📊 সব",
    listView:"🏠 তালিকা", mapView:"🗺 মানচিত্র",
    properties:"সম্পত্তি", rentals:"ভাড়া", forSaleLbl:"বিক্রয়", allListings:"সকল তালিকা",
    noMatch:"কোনো সম্পত্তি পাওয়া যায়নি", clearFilters:"ফিল্টার মুছুন",
    inspSlots:"টি সময়", inspSlot:"টি সময়",
    viewsLabel:"ভিউ", savesLabel:"সেভ",
    listedToday:"আজ তালিকাভুক্ত", listedDaysAgo:"দিন আগে তালিকাভুক্ত",
    included:"অন্তর্ভুক্ত", noUtilities:"কোনো সুবিধা অন্তর্ভুক্ত নেই",
    bookInspection:"পরিদর্শন বুক করুন",
    pickSlot:"একটি সময় বেছে নিন — মালিক/এজেন্ট আপনার ভিজিট নিশ্চিত করবেন।",
    callDirectly:"অথবা সরাসরি ফোন করুন:",
    listedAgo:"তালিকাভুক্ত",
    howItWorks:"বাশা.অ্যাপ মালিকদের জন্য কীভাবে কাজ করে",
    rentingTips:"বাংলাদেশে সম্পত্তির টিপস",
    appsTitle:"মোবাইল অ্যাপ শীঘ্রই আসছে",
    appsSub:"Basha.app সাথে রাখুন। আমাদের অ্যান্ড্রয়েড ও আইওএস অ্যাপ আসছে — চলার পথে সার্চ, সেভ ও পরিদর্শন বুক করুন।",
    appsAndroid:"অ্যান্ড্রয়েড অ্যাপ",
    appsIos:"আইওএস অ্যাপ",
    appsBadge:"শীঘ্রই আসছে",
    verifyOwnership:"মালিকানা যাচাই করুন",
    verifyOwnershipDesc:"চুক্তি স্বাক্ষরের আগে সর্বদা খতিয়ান ও পর্চা নথি চাইুন।",
    writtenDeed:"লিখিত ভাড়া চুক্তি",
    writtenDeedDesc:"একটি নোটারাইজড চুক্তিপত্র ভাড়াটিয়া ও মালিক উভয়কে সুরক্ষিত রাখে।",
    bookInsp:"পরিদর্শন বুক করুন",
    bookInspDesc:"অগ্রিম দেওয়ার আগে সম্পত্তি সশরীরে পরিদর্শন করুন।",
    checkRajuk:"রাজউক অনুমোদন যাচাই করুন",
    checkRajukDesc:"ঢাকার সম্পত্তির জন্য রাজউক বা সিডিএ অনুমোদন যাচাই করুন।",
  },
};

/* ── MOCK DATA ────────────────────────────────── */
const PROPERTIES = [
  { id:1,  title:"Spacious 3-Bed in Bashundhara R/A", titleBn:"বসুন্ধরা আবাসিকে প্রশস্ত ৩ বেড",  type:"apartment",  status:"for-rent", price:32000,  area:1450, beds:3, baths:2, cars:1, floor:7,  location:"Bashundhara R/A, Dhaka",   division:"Dhaka",      img:"", featured:true,  tags:["Semi-Furnished","Gas","Generator"], petFriendly:false, flatmate:false, utilities:["Gas","Water","Generator"], inspSlots:["Fri 30 May — 10:00 AM","Fri 30 May — 2:00 PM","Sat 31 May — 11:00 AM"], agent:"Rahim & Sons", phone:"01711-234567", age:1, views:142, saves:23, ownerId:"owner1" },
  { id:2,  title:"Modern Studio near Gulshan 1", titleBn:"গুলশান ১-এর কাছে আধুনিক স্টুডিও",        type:"apartment",  status:"for-rent", price:18000,  area:480,  beds:1, baths:1, cars:0, floor:4,  location:"Gulshan 1, Dhaka",         division:"Dhaka",      img:"", featured:true,  tags:["Furnished","WiFi","AC"],           petFriendly:true,  flatmate:true,  utilities:["WiFi","Water","AC"],          inspSlots:["Sat 31 May — 10:00 AM","Sun 1 Jun — 10:00 AM"],                       agent:"Home Finders BD", phone:"01811-345678", age:2, views:98,  saves:17, ownerId:"owner1" },
  { id:3,  title:"Family Flat in Uttara Sector 6", titleBn:"উত্তরা সেক্টর ৬-এ ফ্যামিলি ফ্ল্যাট",      type:"apartment",  status:"for-rent", price:22000,  area:1200, beds:3, baths:2, cars:0, floor:3,  location:"Uttara Sector 6, Dhaka",   division:"Dhaka",      img:"", featured:false, tags:["Unfurnished","Generator"],         petFriendly:false, flatmate:false, utilities:["Gas","Water","Generator"],    inspSlots:["Sun 1 Jun — 11:00 AM","Mon 2 Jun — 4:00 PM"],                         agent:"Trust Realty", phone:"01911-456789", age:5, views:67,  saves:9,  ownerId:"owner2" },
  { id:4,  title:"Office Space – Full Floor, Banani", titleBn:"বনানীতে অফিস স্পেস – পূর্ণ ফ্লোর",   type:"commercial", status:"for-rent", price:150000, area:6000, beds:0, baths:4, cars:5, floor:12, location:"Banani, Dhaka",             division:"Dhaka",      img:"", featured:true,  tags:["Full Floor","24/7 Gen","Lift"],    petFriendly:false, flatmate:false, utilities:["Generator","Lift"],            inspSlots:["Mon 2 Jun — 10:00 AM","Tue 3 Jun — 10:00 AM"],                        agent:"Corporate BD", phone:"01611-567890", age:3, views:211, saves:31, ownerId:"owner2" },
  { id:5,  title:"Cozy 2-Bed near Dhanmondi Lake", titleBn:"ধানমন্ডি লেকের কাছে আরামদায়ক ২ বেড",     type:"apartment",  status:"for-rent", price:28000,  area:950,  beds:2, baths:1, cars:0, floor:5,  location:"Dhanmondi, Dhaka",          division:"Dhaka",      img:"", featured:false, tags:["Semi-Furnished","Lake View"],      petFriendly:true,  flatmate:true,  utilities:["Water","Gas"],                inspSlots:["Sat 31 May — 9:00 AM","Sat 31 May — 1:00 PM"],                        agent:"Lake View Homes", phone:"01711-678901", age:2, views:88,  saves:14, ownerId:"owner1" },
  { id:6,  title:"Flat, Panchlaish CDA", titleBn:"পাঁচলাইশ সিডিএ-তে ফ্ল্যাট",      type:"apartment",  status:"for-rent", price:25000,  area:1100, beds:2, baths:2, cars:1, floor:8,  location:"Panchlaish, Chittagong",   division:"Chittagong", img:"", featured:true,  tags:["Semi-Furnished","AC"],  petFriendly:false, flatmate:false, utilities:["AC","Water","Gas"],            inspSlots:["Fri 30 May — 3:00 PM","Sat 31 May — 10:00 AM"],                       agent:"Port City Homes", phone:"01511-789012", age:1, views:134, saves:28, ownerId:"owner2" },
  { id:7,  title:"Budget Room in Mirpur 10", titleBn:"মিরপুর ১০-এ বাজেট রুম",           type:"room",       status:"for-rent", price:7000,   area:200,  beds:1, baths:1, cars:0, floor:2,  location:"Mirpur 10, Dhaka",          division:"Dhaka",      img:"", featured:false, tags:["Attached Bath","WiFi"],            petFriendly:false, flatmate:true,  utilities:["WiFi","Water"],               inspSlots:["Any day — Call to arrange"],                                           agent:"Mirpur Rentals", phone:"01811-890123", age:1, views:55,  saves:6,  ownerId:"owner2" },
  { id:8,  title:"Luxury Penthouse, Baridhara", titleBn:"বারিধারায় লাক্সারি পেন্টহাউস",        type:"apartment",  status:"for-rent", price:120000, area:4200, beds:5, baths:4, cars:2, floor:18, location:"Baridhara, Dhaka",          division:"Dhaka",      img:"", featured:true,  tags:["Fully Furnished","Pool","Gym"],    petFriendly:true,  flatmate:false, utilities:["AC","Pool","Gym","Generator"], inspSlots:["By appointment — Call agent"],                                          agent:"Luxury Lets BD", phone:"01711-901234", age:4, views:309, saves:47, ownerId:"owner1" },
  { id:9,  title:"Luxury Apartment for Sale, Gulshan", titleBn:"গুলশানে বিক্রয়ের জন্য লাক্সারি অ্যাপার্টমেন্ট", type:"apartment",  status:"for-sale", price:12500000,area:2200,beds:4, baths:3, cars:1, floor:10, location:"Gulshan 2, Dhaka",          division:"Dhaka",      img:"", featured:true,  tags:["Ready","Corner","Lift"],           petFriendly:false, flatmate:false, utilities:[],                             inspSlots:["By appointment — Call agent"],                                          agent:"Rahim Properties", phone:"01711-234567", age:2, views:189, saves:35, ownerId:"owner2" },
  { id:10, title:"RAJUK Plot – Purbachal New Town", titleBn:"রাজউক প্লট – পূর্বাচল নিউ টাউন",    type:"land",       status:"for-sale", price:8500000, area:2178,beds:0, baths:0, cars:0, floor:0,  location:"Purbachal New Town, Dhaka", division:"Dhaka",      img:"", featured:false, tags:["RAJUK Approved","Corner Plot"],   petFriendly:false, flatmate:false, utilities:[],                             inspSlots:["Sat 31 May — 9:00 AM","Sun 1 Jun — 9:00 AM"],                          agent:"Plot BD", phone:"01611-567890", age:12, views:76, saves:11, ownerId:"owner1" },
];

const DIVISIONS_EN = ["All Divisions","Dhaka","Chittagong","Sylhet","Rajshahi","Khulna","Barishal","Rangpur","Mymensingh"];
const DIVISIONS_BN = ["সকল বিভাগ","ঢাকা","চট্টগ্রাম","সিলেট","রাজশাহী","খুলনা","বরিশাল","রংপুর","ময়মনসিংহ"];
const PTYPES_EN    = ["All Types","Apartment","Room","House","Commercial","Land"];
const PTYPES_BN    = ["সকল ধরন","অ্যাপার্টমেন্ট","রুম","বাড়ি","বাণিজ্যিক","জমি"];
const AREAS = ["Gulshan","Banani","Dhanmondi","Bashundhara","Uttara","Mirpur","Baridhara","Motijheel","Wari","Mohakhali"];

// Full area + postcode list for autocomplete — 400+ areas
const AREA_SUGGESTIONS = [
  // ── MIRPUR & NORTH WEST ──
  {label:"Mirpur",sub:"Dhaka · 1216"},
  {label:"Mirpur 1",sub:"Dhaka · 1216"},
  {label:"Mirpur 2",sub:"Dhaka · 1216"},
  {label:"Mirpur 6",sub:"Dhaka · 1216"},
  {label:"Mirpur 7",sub:"Dhaka · 1216"},
  {label:"Mirpur 10",sub:"Dhaka · 1216"},
  {label:"Mirpur 11",sub:"Dhaka · 1216"},
  {label:"Mirpur 12",sub:"Dhaka · 1212"},
  {label:"Mirpur 13",sub:"Dhaka · 1216"},
  {label:"Mirpur 14",sub:"Dhaka · 1206"},
  {label:"Mirhajirbag",sub:"Dhaka · 1209"},
  {label:"Pallabi",sub:"Dhaka · 1216"},
  {label:"Rupnagar",sub:"Dhaka · 1216"},
  {label:"Kafrul",sub:"Dhaka · 1206"},
  {label:"Kazipara",sub:"Dhaka · 1216"},
  {label:"Shewrapara",sub:"Dhaka · 1216"},
  {label:"Agargaon",sub:"Dhaka · 1207"},
  {label:"Sher-e-Bangla Nagar",sub:"Dhaka · 1207"},
  {label:"Paikpara",sub:"Dhaka · 1216"},
  {label:"Duaripara",sub:"Dhaka · 1216"},
  {label:"Ibrahimpur",sub:"Dhaka · 1206"},
  {label:"Cantonment",sub:"Dhaka · 1206"},

  // ── UTTARA & NORTH ──
  {label:"Uttara",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 1",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 2",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 3",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 4",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 5",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 6",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 7",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 9",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 10",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 11",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 12",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 13",sub:"Dhaka · 1230"},
  {label:"Uttara West",sub:"Dhaka · 1230"},
  {label:"Uttara East",sub:"Dhaka · 1230"},
  {label:"Diabari",sub:"Dhaka · 1230"},
  {label:"Turag",sub:"Dhaka · 1230"},
  {label:"Dakshinkhan",sub:"Dhaka · 1230"},
  {label:"Uttarkhan",sub:"Dhaka · 1230"},
  {label:"Ashkona",sub:"Dhaka · 1229"},
  {label:"Khilkhet",sub:"Dhaka · 1229"},
  {label:"Nikunja",sub:"Dhaka · 1229"},
  {label:"Airport",sub:"Dhaka · 1229"},

  // ── GULSHAN, BANANI, BARIDHARA ──
  {label:"Gulshan",sub:"Dhaka · 1212"},
  {label:"Gulshan 1",sub:"Dhaka · 1212"},
  {label:"Gulshan 2",sub:"Dhaka · 1212"},
  {label:"Banani",sub:"Dhaka · 1213"},
  {label:"Banani DOHS",sub:"Dhaka · 1206"},
  {label:"Baridhara",sub:"Dhaka · 1212"},
  {label:"Baridhara DOHS",sub:"Dhaka · 1206"},
  {label:"Bashundhara R/A",sub:"Dhaka · 1229"},
  {label:"Mohakhali",sub:"Dhaka · 1212"},
  {label:"Niketan",sub:"Dhaka · 1212"},
  {label:"Shahjadpur",sub:"Dhaka · 1212"},
  {label:"Norda",sub:"Dhaka · 1212"},
  {label:"Aftabnagar",sub:"Dhaka · 1212"},
  {label:"Natun Bazar",sub:"Dhaka · 1212"},

  // ── DHANMONDI, MOHAMMADPUR, WEST ──
  {label:"Dhanmondi",sub:"Dhaka · 1209"},
  {label:"Dhanmondi 27",sub:"Dhaka · 1209"},
  {label:"Dhanmondi 32",sub:"Dhaka · 1209"},
  {label:"Mohammadpur",sub:"Dhaka · 1207"},
  {label:"Shyamoli",sub:"Dhaka · 1207"},
  {label:"Adabor",sub:"Dhaka · 1207"},
  {label:"Rayer Bazar",sub:"Dhaka · 1209"},
  {label:"Kalabagan",sub:"Dhaka · 1205"},
  {label:"Lalmatia",sub:"Dhaka · 1207"},
  {label:"Zigatola",sub:"Dhaka · 1209"},
  {label:"Jigatola",sub:"Dhaka · 1209"},
  {label:"Hazaribagh",sub:"Dhaka · 1209"},
  {label:"Sat Masjid Road",sub:"Dhaka · 1207"},
  {label:"Ring Road",sub:"Dhaka · 1207"},
  {label:"Bosila",sub:"Dhaka · 1207"},

  // ── FARMGATE, TEJGAON, CENTRAL ──
  {label:"Farmgate",sub:"Dhaka · 1215"},
  {label:"Tejgaon",sub:"Dhaka · 1208"},
  {label:"Tejgaon Industrial",sub:"Dhaka · 1208"},
  {label:"Bijoy Nagar",sub:"Dhaka · 1000"},
  {label:"Karwan Bazar",sub:"Dhaka · 1215"},
  {label:"Panthapath",sub:"Dhaka · 1205"},
  {label:"Elephant Road",sub:"Dhaka · 1205"},
  {label:"New Market",sub:"Dhaka · 1205"},
  {label:"Nilkhet",sub:"Dhaka · 1205"},
  {label:"Azimpur",sub:"Dhaka · 1205"},
  {label:"Hatirjheel",sub:"Dhaka · 1217"},

  // ── MOTIJHEEL, PALTAN, CENTRAL BUSINESS ──
  {label:"Motijheel",sub:"Dhaka · 1000"},
  {label:"Paltan",sub:"Dhaka · 1000"},
  {label:"Kakrail",sub:"Dhaka · 1000"},
  {label:"Eskaton",sub:"Dhaka · 1000"},
  {label:"Segunbagicha",sub:"Dhaka · 1000"},
  {label:"Ramna",sub:"Dhaka · 1000"},
  {label:"Matsya Bhaban",sub:"Dhaka · 1000"},
  {label:"Dilkusha",sub:"Dhaka · 1000"},
  {label:"Topkhana",sub:"Dhaka · 1000"},
  {label:"Purana Paltan",sub:"Dhaka · 1000"},
  {label:"Naya Paltan",sub:"Dhaka · 1000"},
  {label:"Shantinagar",sub:"Dhaka · 1217"},
  {label:"Mouchak",sub:"Dhaka · 1217"},
  {label:"Siddheshwari",sub:"Dhaka · 1217"},
  {label:"Shahjanpur",sub:"Dhaka · 1217"},

  // ── BADDA, RAMPURA, EAST ──
  {label:"Badda",sub:"Dhaka · 1212"},
  {label:"North Badda",sub:"Dhaka · 1212"},
  {label:"South Badda",sub:"Dhaka · 1212"},
  {label:"Rampura",sub:"Dhaka · 1219"},
  {label:"East Rampura",sub:"Dhaka · 1219"},
  {label:"Malibagh",sub:"Dhaka · 1217"},
  {label:"Malibagh Chowdhurypara",sub:"Dhaka · 1217"},
  {label:"Khilgaon",sub:"Dhaka · 1219"},
  {label:"Mugda",sub:"Dhaka · 1214"},
  {label:"North Mugda",sub:"Dhaka · 1214"},
  {label:"South Mugda",sub:"Dhaka · 1214"},
  {label:"Tilpapara",sub:"Dhaka · 1214"},
  {label:"Basabo",sub:"Dhaka · 1214"},
  {label:"Sabujbagh",sub:"Dhaka · 1214"},
  {label:"Manikdi",sub:"Dhaka · 1206"},

  // ── JATRABARI, SOUTH EAST ──
  {label:"Jatrabari",sub:"Dhaka · 1204"},
  {label:"North Jatrabari",sub:"Dhaka · 1204"},
  {label:"South Jatrabari",sub:"Dhaka · 1204"},
  {label:"Dhonia",sub:"Dhaka · 1236"},
  {label:"Matuail",sub:"Dhaka · 1362"},
  {label:"Shyampur",sub:"Dhaka · 1204"},
  {label:"Kadamtali",sub:"Dhaka · 1204"},
  {label:"Rayerbag",sub:"Dhaka · 1204"},
  {label:"Demra",sub:"Dhaka · 1361"},
  {label:"Saidabad",sub:"Dhaka · 1204"},
  {label:"Jurain",sub:"Dhaka · 1204"},
  {label:"Kutubkhali",sub:"Dhaka · 1204"},
  {label:"Dholaipar",sub:"Dhaka · 1204"},
  {label:"Katherpool",sub:"Dhaka · 1204"},
  {label:"Pagla",sub:"Dhaka · 1362"},
  {label:"Postogola",sub:"Dhaka · 1204"},
  {label:"Shonirakhra",sub:"Dhaka · 1204"},
  {label:"Narayanganj",sub:"Dhaka Div · 1400"},

  // ── WARI, GOPIBAGH, OLD DHAKA EAST ──
  {label:"Wari",sub:"Dhaka · 1203"},
  {label:"Gopibagh",sub:"Dhaka · 1203"},
  {label:"Narinda",sub:"Dhaka · 1100"},
  {label:"Bangshal",sub:"Dhaka · 1100"},
  {label:"Sutrapur",sub:"Dhaka · 1100"},
  {label:"Gandaria",sub:"Dhaka · 1100"},
  {label:"Tipu Sultan Road",sub:"Dhaka · 1100"},
  {label:"Islampur",sub:"Dhaka · 1100"},
  {label:"Patuatuli",sub:"Dhaka · 1100"},
  {label:"Rankin Street",sub:"Dhaka · 1203"},
  {label:"Johnson Road",sub:"Dhaka · 1100"},

  // ── LALBAGH, OLD DHAKA WEST ──
  {label:"Lalbagh",sub:"Dhaka · 1211"},
  {label:"Lalbagh Fort Area",sub:"Dhaka · 1211"},
  {label:"Chawkbazar",sub:"Dhaka · 1211"},
  {label:"Chowk Bazar",sub:"Dhaka · 1211"},
  {label:"Nawabpur",sub:"Dhaka · 1100"},
  {label:"Urdu Road",sub:"Dhaka · 1211"},
  {label:"Nazira Bazar",sub:"Dhaka · 1211"},
  {label:"Tanti Bazar",sub:"Dhaka · 1100"},
  {label:"Shankhari Bazar",sub:"Dhaka · 1100"},
  {label:"Mitford",sub:"Dhaka · 1100"},
  {label:"Sadarghat",sub:"Dhaka · 1100"},
  {label:"Farashganj",sub:"Dhaka · 1100"},
  {label:"Nababganj",sub:"Dhaka · 1211"},
  {label:"Imamganj",sub:"Dhaka · 1100"},
  {label:"Zigatola",sub:"Dhaka · 1209"},

  // ── KAMRANGIRCHAR, SOUTH WEST ──
  {label:"Kamrangirchar",sub:"Dhaka · 1211"},
  {label:"Keraniganj",sub:"Dhaka · 1310"},
  {label:"Malibaghbazar",sub:"Dhaka · 1217"},

  // ── SOUTH CITY / BURIGANGA ──
  {label:"Lakshmibazar",sub:"Dhaka · 1100"},
  {label:"Kathalbagan",sub:"Dhaka · 1205"},
  {label:"Doyaganj",sub:"Dhaka · 1204"},
  {label:"Swamibagh",sub:"Dhaka · 1203"},
  {label:"Rahmatganj",sub:"Dhaka · 1211"},
  {label:"Hajaribagh",sub:"Dhaka · 1209"},

  // ── PURBACHAL, OUTER EAST ──
  {label:"Purbachal",sub:"Dhaka · 1461"},
  {label:"Purbachal New Town",sub:"Dhaka · 1461"},
  {label:"300 Feet",sub:"Dhaka · 1229"},
  {label:"Vatara",sub:"Dhaka · 1212"},
  {label:"Bhatara",sub:"Dhaka · 1212"},
  {label:"Kanchpur",sub:"Narayanganj · 1461"},

  // ── SAVAR, OUTER WEST ──
  {label:"Savar",sub:"Dhaka · 1340"},
  {label:"Ashulia",sub:"Dhaka · 1345"},
  {label:"Hemayetpur",sub:"Dhaka · 1340"},
  {label:"Dhamrai",sub:"Dhaka · 1350"},
  {label:"Gazipur",sub:"Dhaka Div · 1700"},
  {label:"Tongi",sub:"Gazipur · 1712"},
  {label:"Joydebpur",sub:"Gazipur · 1700"},
  {label:"Board Bazar",sub:"Gazipur · 1703"},

  // ── CHITTAGONG ──
  {label:"Panchlaish",sub:"Chittagong · 4203"},
  {label:"Khulshi",sub:"Chittagong · 4225"},
  {label:"Agrabad",sub:"Chittagong · 4100"},
  {label:"Nasirabad",sub:"Chittagong · 4210"},
  {label:"Halishahar",sub:"Chittagong · 4216"},
  {label:"Pahartali",sub:"Chittagong · 4202"},
  {label:"Oxygen",sub:"Chittagong · 4209"},
  {label:"GEC Circle",sub:"Chittagong · 4203"},
  {label:"Chawkbazar Ctg",sub:"Chittagong · 4000"},
  {label:"Muradpur",sub:"Chittagong · 4210"},
  {label:"Bahaddarhat",sub:"Chittagong · 4210"},
  {label:"Kalurghat",sub:"Chittagong · 4210"},
  {label:"Dewanhat",sub:"Chittagong · 4000"},
  {label:"Kotwali Ctg",sub:"Chittagong · 4000"},
  {label:"Double Mooring",sub:"Chittagong · 4100"},
  {label:"Bandar",sub:"Chittagong · 4100"},
  {label:"Bayezid",sub:"Chittagong · 4209"},
  {label:"Chandgaon",sub:"Chittagong · 4212"},
  {label:"Bakalia",sub:"Chittagong · 4000"},
  {label:"Sadarghat Ctg",sub:"Chittagong · 4000"},
  {label:"Lalkhan Bazar",sub:"Chittagong · 4000"},
  {label:"Enayet Bazar",sub:"Chittagong · 4000"},
  {label:"CDA Avenue",sub:"Chittagong · 4203"},
  {label:"Dampara",sub:"Chittagong · 4000"},
  {label:"Patharghata",sub:"Chittagong · 4000"},
  {label:"Sholoshohor",sub:"Chittagong · 4210"},

  // ── SYLHET ──
  {label:"Sylhet Sadar",sub:"Sylhet · 3100"},
  {label:"Zindabazar",sub:"Sylhet · 3100"},
  {label:"Amberkhana",sub:"Sylhet · 3100"},
  {label:"Subhanighat",sub:"Sylhet · 3100"},
  {label:"Kumarpara",sub:"Sylhet · 3100"},
  {label:"Tilagarh",sub:"Sylhet · 3100"},
  {label:"Shibganj",sub:"Sylhet · 3100"},
  {label:"Modina Market",sub:"Sylhet · 3100"},
  {label:"Upashahar",sub:"Sylhet · 3100"},
  {label:"Shahjalal Upashahar",sub:"Sylhet · 3100"},

  // ── RAJSHAHI ──
  {label:"Rajshahi Sadar",sub:"Rajshahi · 6000"},
  {label:"Boalia",sub:"Rajshahi · 6000"},
  {label:"Shaheb Bazar",sub:"Rajshahi · 6000"},
  {label:"Uposhohor",sub:"Rajshahi · 6000"},
  {label:"Kazla",sub:"Rajshahi · 6000"},
  {label:"Talaimari",sub:"Rajshahi · 6203"},

  // ── KHULNA ──
  {label:"Khulna Sadar",sub:"Khulna · 9000"},
  {label:"Sonadanga",sub:"Khulna · 9100"},
  {label:"Khalishpur",sub:"Khulna · 9000"},
  {label:"Daulatpur",sub:"Khulna · 9000"},
  {label:"Boyra",sub:"Khulna · 9000"},
  {label:"Nirala",sub:"Khulna · 9100"},

  // ── BARISHAL ──
  {label:"Barishal Sadar",sub:"Barishal · 8200"},
  {label:"Natullabad",sub:"Barishal · 8200"},
  {label:"Ruplal",sub:"Barishal · 8200"},
  {label:"Band Road",sub:"Barishal · 8200"},

  // ── RANGPUR ──
  {label:"Rangpur Sadar",sub:"Rangpur · 5400"},
  {label:"Shapla Chottor",sub:"Rangpur · 5400"},
  {label:"Dhap",sub:"Rangpur · 5400"},

  // ── MYMENSINGH ──
  {label:"Mymensingh Sadar",sub:"Mymensingh · 2200"},
  {label:"Ganginar Par",sub:"Mymensingh · 2200"},
  {label:"Chorpara",sub:"Mymensingh · 2200"},

  // ── MOHAMMADPUR DETAIL (from photo 9) ──
  {label:"Mohammadpur Housing",sub:"Dhaka · 1207"},
  {label:"Mohammadia Housing Society",sub:"Dhaka · 1207"},
  {label:"Mohammadia Housing",sub:"Dhaka · 1207"},
  {label:"Katpur",sub:"Dhaka · 1207"},
  {label:"Kaderabad Housing",sub:"Dhaka · 1207"},
  {label:"Nabinpur Housing",sub:"Dhaka · 1207"},
  {label:"Chand Uddan",sub:"Dhaka · 1207"},
  {label:"Cha Uddan",sub:"Dhaka · 1207"},
  {label:"Dhaka Uddan",sub:"Dhaka · 1207"},
  {label:"Ramchandrapur",sub:"Dhaka · 1207"},
  {label:"Bosila",sub:"Dhaka · 1207"},
  {label:"Bosila Garden City",sub:"Dhaka · 1207"},
  {label:"Biswas Garden City",sub:"Dhaka · 1207"},
  {label:"Avenue Road 2",sub:"Dhaka · 1207"},
  {label:"Zafarabad",sub:"Dhaka · 1207"},
  {label:"Shankar",sub:"Dhaka · 1207"},
  {label:"Santangor",sub:"Dhaka · 1207"},
  {label:"Waspur",sub:"Dhaka · 1207"},
  {label:"Gazimohol",sub:"Dhaka · 1207"},
  {label:"Aud Char",sub:"Dhaka · 1207"},
  {label:"Natarchor",sub:"Dhaka · 1207"},
  {label:"Shaymoli Housing",sub:"Dhaka · 1207"},
  {label:"Pashchim Shyamoli",sub:"Dhaka · 1207"},

  // ── DHANMONDI DETAIL ──
  {label:"Dhanmondi",sub:"Dhaka · 1209"},
  {label:"West Dhanmondi",sub:"Dhaka · 1209"},
  {label:"Pashchim Dhanmondi",sub:"Dhaka · 1209"},
  {label:"Dhanmondi 1",sub:"Dhaka · 1209"},
  {label:"Dhanmondi 2",sub:"Dhaka · 1209"},
  {label:"Dhanmondi 3",sub:"Dhaka · 1209"},
  {label:"Dhanmondi 4",sub:"Dhaka · 1209"},
  {label:"Dhanmondi 5",sub:"Dhaka · 1209"},
  {label:"Dhanmondi 6",sub:"Dhaka · 1205"},
  {label:"Dhanmondi 7",sub:"Dhaka · 1205"},
  {label:"Dhanmondi 8",sub:"Dhaka · 1205"},
  {label:"Dhanmondi 9",sub:"Dhaka · 1209"},
  {label:"Dhanmondi 10",sub:"Dhaka · 1209"},
  {label:"Dhanmondi 11",sub:"Dhaka · 1209"},
  {label:"Dhanmondi 12",sub:"Dhaka · 1209"},
  {label:"Dhanmondi 13",sub:"Dhaka · 1209"},
  {label:"Dhanmondi 15",sub:"Dhaka · 1209"},
  {label:"Dhanmondi 27",sub:"Dhaka · 1209"},
  {label:"Dhanmondi 32",sub:"Dhaka · 1209"},
  {label:"Road 16 Dhanmondi",sub:"Dhaka · 1209"},
  {label:"Sobhanbagh",sub:"Dhaka · 1207"},
  {label:"Rajabazar",sub:"Dhaka · 1215"},
  {label:"Lalmatia",sub:"Dhaka · 1207"},
  {label:"Kathabagan",sub:"Dhaka · 1205"},
  {label:"Katalbagan",sub:"Dhaka · 1205"},
  {label:"Panthapath",sub:"Dhaka · 1205"},
  {label:"Pashchim Panthapath",sub:"Dhaka · 1205"},
  {label:"Lakshmibazar Dhanmondi",sub:"Dhaka · 1205"},
  {label:"Lake Circus",sub:"Dhaka · 1205"},
  {label:"Pashchim Panta Path",sub:"Dhaka · 1205"},
  {label:"Jigatola",sub:"Dhaka · 1209"},
  {label:"Zigatola",sub:"Dhaka · 1209"},
  {label:"Nilkhet",sub:"Dhaka · 1205"},
  {label:"Neel khet",sub:"Dhaka · 1205"},

  // ── KALABAGAN AREA ──
  {label:"Kalabagan",sub:"Dhaka · 1205"},
  {label:"Indira Road",sub:"Dhaka · 1215"},
  {label:"Mazar Road",sub:"Dhaka · 1207"},
  {label:"Asad Avenue",sub:"Dhaka · 1207"},
  {label:"Manik Mia Avenue",sub:"Dhaka · 1207"},
  {label:"Sher-e-Bangla Nagar",sub:"Dhaka · 1207"},

  // ── FARMGATE / TEJGAON / CENTRAL ──
  {label:"Farmgate",sub:"Dhaka · 1215"},
  {label:"Karwan Bazar",sub:"Dhaka · 1215"},
  {label:"Tejgaon",sub:"Dhaka · 1208"},
  {label:"Tejgaon Industrial Area",sub:"Dhaka · 1208"},
  {label:"Nakhalpara",sub:"Dhaka · 1215"},
  {label:"Bijoy Nagar",sub:"Dhaka · 1000"},
  {label:"Bijoy Sarani",sub:"Dhaka · 1000"},
  {label:"Bijoy Sarani Metro",sub:"Dhaka · 1000"},
  {label:"Manipuri Para",sub:"Dhaka · 1215"},
  {label:"Monipur",sub:"Dhaka · 1216"},

  // ── GULSHAN / BANANI / BARIDHARA DETAIL ──
  {label:"Gulshan",sub:"Dhaka · 1212"},
  {label:"Gulshan 1",sub:"Dhaka · 1212"},
  {label:"Gulshan 2",sub:"Dhaka · 1212"},
  {label:"Gulshan Avenue",sub:"Dhaka · 1212"},
  {label:"Gulshan Circle 1",sub:"Dhaka · 1212"},
  {label:"Gulshan Circle 2",sub:"Dhaka · 1212"},
  {label:"Niketon",sub:"Dhaka · 1212"},
  {label:"Niketon Society",sub:"Dhaka · 1212"},
  {label:"Banani",sub:"Dhaka · 1213"},
  {label:"Banani DOHS",sub:"Dhaka · 1206"},
  {label:"Banani Road 1",sub:"Dhaka · 1213"},
  {label:"Banani Road 11",sub:"Dhaka · 1213"},
  {label:"Baridhara",sub:"Dhaka · 1212"},
  {label:"Baridhara DOHS",sub:"Dhaka · 1206"},
  {label:"Bashundhara R/A",sub:"Dhaka · 1229"},
  {label:"Mohakhali",sub:"Dhaka · 1212"},
  {label:"Mohakhali DOHS",sub:"Dhaka · 1206"},
  {label:"Shahjadpur",sub:"Dhaka · 1212"},
  {label:"Natun Bazar",sub:"Dhaka · 1212"},
  {label:"Norda",sub:"Dhaka · 1212"},
  {label:"Aftabnagar",sub:"Dhaka · 1212"},
  {label:"Halirjheel Link Road",sub:"Dhaka · 1212"},
  {label:"Tejgaon-Gulshan Link Road",sub:"Dhaka · 1208"},

  // ── UTTARA FULL SECTORS ──
  {label:"Uttara",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 1",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 2",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 3",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 4",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 5",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 6",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 7",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 8",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 9",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 10",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 11",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 12",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 13",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 14",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 15",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 16",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 17",sub:"Dhaka · 1230"},
  {label:"Uttara Sector 18",sub:"Dhaka · 1230"},
  {label:"Uttara West",sub:"Dhaka · 1230"},
  {label:"Uttara East",sub:"Dhaka · 1230"},
  {label:"Uttara Model Town",sub:"Dhaka · 1230"},
  {label:"Diabari",sub:"Dhaka · 1230"},
  {label:"Abdullahpur",sub:"Dhaka · 1230"},
  {label:"Rajlakshmi",sub:"Dhaka · 1230"},
  {label:"Azampur",sub:"Dhaka · 1230"},
  {label:"South Azampur",sub:"Dhaka · 1230"},
  {label:"Pakuria",sub:"Dhaka · 1230"},
  {label:"Dhalnagar",sub:"Dhaka · 1230"},
  {label:"Sonargaon Janapath",sub:"Dhaka · 1230"},
  {label:"Rajia Sultana Road",sub:"Dhaka · 1230"},
  {label:"Azampur",sub:"Dhaka · 1230"},
  {label:"Gawair",sub:"Dhaka · 1230"},
  {label:"Nabeen",sub:"Dhaka · 1230"},
  {label:"Gulbari",sub:"Dhaka · 1230"},
  {label:"Baraidha",sub:"Dhaka · 1230"},

  // ── TONGI / NORTH OF UTTARA (photo 8) ──
  {label:"Tongi",sub:"Gazipur · 1712"},
  {label:"Tongi Station",sub:"Gazipur · 1712"},
  {label:"Cheba Ali",sub:"Gazipur · 1712"},
  {label:"Cherabari",sub:"Gazipur · 1712"},
  {label:"Vatuliya",sub:"Gazipur · 1712"},
  {label:"Kamarjora",sub:"Gazipur · 1712"},
  {label:"Banarctek",sub:"Gazipur · 1712"},
  {label:"Brangatek",sub:"Gazipur · 1712"},
  {label:"Ghorer",sub:"Gazipur · 1712"},
  {label:"Rambhola",sub:"Gazipur · 1712"},
  {label:"Naya Nagar",sub:"Gazipur · 1712"},
  {label:"Nalchira",sub:"Gazipur · 1712"},
  {label:"KBM Road Tongi",sub:"Gazipur · 1712"},
  {label:"Joydebpur",sub:"Gazipur · 1700"},
  {label:"Board Bazar",sub:"Gazipur · 1703"},
  {label:"Gazipur Sadar",sub:"Gazipur · 1700"},
  {label:"Metro Rail Depot",sub:"Gazipur · 1712"},

  // ── MIRPUR FULL DETAIL (photo 6) ──
  {label:"Mirpur",sub:"Dhaka · 1216"},
  {label:"Mirpur 1",sub:"Dhaka · 1216"},
  {label:"Mirpur 2",sub:"Dhaka · 1216"},
  {label:"Mirpur 6",sub:"Dhaka · 1216"},
  {label:"Mirpur 7",sub:"Dhaka · 1216"},
  {label:"Mirpur 9",sub:"Dhaka · 1216"},
  {label:"Mirpur 10",sub:"Dhaka · 1216"},
  {label:"Mirpur 10 Road",sub:"Dhaka · 1216"},
  {label:"Mirpur 11",sub:"Dhaka · 1216"},
  {label:"Mirpur 11.5",sub:"Dhaka · 1216"},
  {label:"Mirpur 12",sub:"Dhaka · 1212"},
  {label:"Mirpur 13",sub:"Dhaka · 1216"},
  {label:"Mirpur 14",sub:"Dhaka · 1206"},
  {label:"Mirpur DOHS",sub:"Dhaka · 1216"},
  {label:"Mirpur Cantonment",sub:"Dhaka · 1216"},
  {label:"South Mirpur",sub:"Dhaka · 1216"},
  {label:"Dakshinkhan Mirpur",sub:"Dhaka · 1216"},
  {label:"Mirhajirbag",sub:"Dhaka · 1209"},
  {label:"Pallabi",sub:"Dhaka · 1216"},
  {label:"Rupnagar",sub:"Dhaka · 1216"},
  {label:"Paikpara",sub:"Dhaka · 1216"},
  {label:"Kafrul",sub:"Dhaka · 1206"},
  {label:"Kazipara",sub:"Dhaka · 1216"},
  {label:"Shewrapara",sub:"Dhaka · 1216"},
  {label:"Agargaon",sub:"Dhaka · 1207"},
  {label:"Palash Nagar",sub:"Dhaka · 1216"},
  {label:"East Matikata",sub:"Dhaka · 1206"},
  {label:"West Matikata",sub:"Dhaka · 1206"},
  {label:"Matikata",sub:"Dhaka · 1206"},
  {label:"Eastern Housing",sub:"Dhaka · 1216"},
  {label:"Pirerbag",sub:"Dhaka · 1216"},
  {label:"North Pirerbag",sub:"Dhaka · 1216"},
  {label:"South Pirerbag",sub:"Dhaka · 1216"},
  {label:"West Kafrul",sub:"Dhaka · 1206"},
  {label:"Ibrahimpur",sub:"Dhaka · 1206"},
  {label:"Cantonment",sub:"Dhaka · 1206"},
  {label:"Duaripara",sub:"Dhaka · 1216"},
  {label:"Goldan Chowkbazi",sub:"Dhaka · 1216"},

  // ── KHILKHET / NIKUNJA / AIRPORT (photo 7) ──
  {label:"Khilkhet",sub:"Dhaka · 1229"},
  {label:"Nikunja",sub:"Dhaka · 1229"},
  {label:"Nikunja 1",sub:"Dhaka · 1229"},
  {label:"Nikunja 2",sub:"Dhaka · 1229"},
  {label:"Airport",sub:"Dhaka · 1229"},
  {label:"Airport Road",sub:"Dhaka · 1229"},
  {label:"Ashkona",sub:"Dhaka · 1229"},
  {label:"Kurmitola",sub:"Dhaka · 1229"},
  {label:"Cantonment Dhaka",sub:"Dhaka · 1206"},
  {label:"Aniyaan City",sub:"Dhaka · 1229"},
  {label:"Canal Para",sub:"Dhaka · 1229"},

  // ── RAYER BAZAR / WEST DHAKA (photo 9) ──
  {label:"Rayer Bazar",sub:"Dhaka · 1209"},
  {label:"West Rayer Bazar",sub:"Dhaka · 1209"},
  {label:"Pashchim Rayer Bazar",sub:"Dhaka · 1209"},
  {label:"Hajaribagh",sub:"Dhaka · 1209"},
  {label:"Hazaribagh",sub:"Dhaka · 1209"},
  {label:"Kamrangirchar",sub:"Dhaka · 1211"},
  {label:"Lalbagh",sub:"Dhaka · 1211"},
  {label:"Lalbagh Fort",sub:"Dhaka · 1211"},
  {label:"Chawkbazar",sub:"Dhaka · 1211"},
  {label:"Nababpur",sub:"Dhaka · 1100"},
  {label:"Islamnagar",sub:"Dhaka · 1207"},
  {label:"Islamabad",sub:"Dhaka · 1207"},
  {label:"Nurjahan Road",sub:"Dhaka · 1207"},
  {label:"Adarsha Nagar",sub:"Dhaka · 1207"},
  {label:"Iqbalpur",sub:"Dhaka · 1207"},

  // ── JATRABARI / SOUTH EAST DETAIL (photo 1) ──
  {label:"Jatrabari",sub:"Dhaka · 1204"},
  {label:"North Jatrabari",sub:"Dhaka · 1204"},
  {label:"South Jatrabari",sub:"Dhaka · 1204"},
  {label:"Uttar Jatrabari",sub:"Dhaka · 1204"},
  {label:"Dakhin Jatrabari",sub:"Dhaka · 1204"},
  {label:"Jatrabari Bazar",sub:"Dhaka · 1204"},
  {label:"Saidabad",sub:"Dhaka · 1204"},
  {label:"Shyampur",sub:"Dhaka · 1204"},
  {label:"Kadamtali",sub:"Dhaka · 1204"},
  {label:"Rayerbag",sub:"Dhaka · 1204"},
  {label:"Dhonia",sub:"Dhaka · 1236"},
  {label:"Matuail",sub:"Dhaka · 1362"},
  {label:"Matuail New Town",sub:"Dhaka · 1362"},
  {label:"Demra",sub:"Dhaka · 1361"},
  {label:"Jurain",sub:"Dhaka · 1204"},
  {label:"Dholaipar",sub:"Dhaka · 1204"},
  {label:"Kutubkhali",sub:"Dhaka · 1204"},
  {label:"Postogola",sub:"Dhaka · 1204"},
  {label:"Shonirakhra",sub:"Dhaka · 1204"},
  {label:"Kazla",sub:"Dhaka · 1204"},
  {label:"Shekdi",sub:"Dhaka · 1204"},
  {label:"Pagla",sub:"Dhaka · 1362"},
  {label:"Mur Hajirbag",sub:"Dhaka · 1204"},
  {label:"Mir Hajirbag",sub:"Dhaka · 1204"},
  {label:"Manda",sub:"Dhaka · 1219"},
  {label:"South Manda",sub:"Dhaka · 1219"},
  {label:"R110 Area",sub:"Dhaka · 1204"},
  {label:"Padadogar",sub:"Dhaka · 1204"},
  {label:"Konabari",sub:"Gazipur · 1346"},

  // ── WARI / OLD DHAKA EAST ──
  {label:"Wari",sub:"Dhaka · 1203"},
  {label:"Gopibagh",sub:"Dhaka · 1203"},
  {label:"Narinda",sub:"Dhaka · 1100"},
  {label:"Bangshal",sub:"Dhaka · 1100"},
  {label:"Sutrapur",sub:"Dhaka · 1100"},
  {label:"Gandaria",sub:"Dhaka · 1100"},
  {label:"Islampur",sub:"Dhaka · 1100"},
  {label:"Patuatuli",sub:"Dhaka · 1100"},
  {label:"Johnson Road",sub:"Dhaka · 1100"},
  {label:"Tipu Sultan Road",sub:"Dhaka · 1100"},
  {label:"Rankin Street",sub:"Dhaka · 1203"},
  {label:"Tanti Bazar",sub:"Dhaka · 1100"},
  {label:"Shankhari Bazar",sub:"Dhaka · 1100"},
  {label:"Mitford",sub:"Dhaka · 1100"},
  {label:"Sadarghat",sub:"Dhaka · 1100"},
  {label:"Farashganj",sub:"Dhaka · 1100"},
  {label:"Nababganj",sub:"Dhaka · 1211"},
  {label:"Armanitola",sub:"Dhaka · 1100"},

  // ── MOTIJHEEL / PALTAN / CBD ──
  {label:"Motijheel",sub:"Dhaka · 1000"},
  {label:"Paltan",sub:"Dhaka · 1000"},
  {label:"Purana Paltan",sub:"Dhaka · 1000"},
  {label:"Naya Paltan",sub:"Dhaka · 1000"},
  {label:"Kakrail",sub:"Dhaka · 1000"},
  {label:"Eskaton",sub:"Dhaka · 1000"},
  {label:"Segunbagicha",sub:"Dhaka · 1000"},
  {label:"Ramna",sub:"Dhaka · 1000"},
  {label:"Dilkusha",sub:"Dhaka · 1000"},
  {label:"Topkhana Road",sub:"Dhaka · 1000"},
  {label:"Matsya Bhaban",sub:"Dhaka · 1000"},
  {label:"Mouchak",sub:"Dhaka · 1217"},
  {label:"Shantinagar",sub:"Dhaka · 1217"},
  {label:"Siddheshwari",sub:"Dhaka · 1217"},
  {label:"Shahjanpur",sub:"Dhaka · 1217"},
  {label:"Malibagh",sub:"Dhaka · 1217"},
  {label:"Malibagh Chowdhurypara",sub:"Dhaka · 1217"},
  {label:"Rajarbagh",sub:"Dhaka · 1217"},
  {label:"Khilgaon",sub:"Dhaka · 1219"},
  {label:"Tilpapara",sub:"Dhaka · 1214"},
  {label:"Mugda",sub:"Dhaka · 1214"},
  {label:"North Mugda",sub:"Dhaka · 1214"},
  {label:"South Mugda",sub:"Dhaka · 1214"},
  {label:"Basabo",sub:"Dhaka · 1214"},
  {label:"Sabujbagh",sub:"Dhaka · 1214"},
  {label:"Rampura",sub:"Dhaka · 1219"},
  {label:"East Rampura",sub:"Dhaka · 1219"},
  {label:"Badda",sub:"Dhaka · 1212"},
  {label:"North Badda",sub:"Dhaka · 1212"},
  {label:"South Badda",sub:"Dhaka · 1212"},
  {label:"Vatara",sub:"Dhaka · 1212"},
  {label:"Bhatara",sub:"Dhaka · 1212"},
  {label:"Aftabnagar",sub:"Dhaka · 1212"},
  {label:"Hatirjheel",sub:"Dhaka · 1217"},

  // ── KERANIGANJ / SOUTH WEST (photo 3) ──
  {label:"Keraniganj",sub:"Dhaka · 1310"},
  {label:"Zinzira",sub:"Dhaka · 1310"},
  {label:"Zinzira Dhaka",sub:"Dhaka · 1310"},
  {label:"Razakhali",sub:"Dhaka · 1310"},
  {label:"Aganagar",sub:"Dhaka · 1310"},
  {label:"Islamabad Keraniganj",sub:"Dhaka · 1310"},
  {label:"Bolayer Mohol",sub:"Dhaka · 1310"},
  {label:"Hasnahabad",sub:"Dhaka · 1310"},
  {label:"Azizur Rahman",sub:"Dhaka · 1310"},
  {label:"Atibazar",sub:"Dhaka · 1310"},
  {label:"Nazirabag",sub:"Dhaka · 1310"},
  {label:"Ghatabari",sub:"Dhaka · 1310"},
  {label:"Gobra",sub:"Dhaka · 1310"},
  {label:"Choddar Gaon",sub:"Dhaka · 1310"},
  {label:"Heyjazbag",sub:"Dhaka · 1310"},
  {label:"Bansholay",sub:"Dhaka · 1310"},
  {label:"Kalunagar",sub:"Dhaka · 1310"},
  {label:"Mil Barak",sub:"Dhaka · 1310"},
  {label:"Mombartoli",sub:"Dhaka · 1310"},
  {label:"Ranirbazar",sub:"Dhaka · 1310"},
  {label:"Birulia",sub:"Dhaka · 1310"},
  {label:"Kodomtoli",sub:"Dhaka · 1310"},
  {label:"Yunusbag",sub:"Dhaka · 1310"},

  // ── SAVAR / ASHULIA / OUTER ──
  {label:"Savar",sub:"Dhaka · 1340"},
  {label:"Ashulia",sub:"Dhaka · 1345"},
  {label:"Hemayetpur",sub:"Dhaka · 1340"},
  {label:"Dhamrai",sub:"Dhaka · 1350"},
  {label:"Narayanganj",sub:"Dhaka Div · 1400"},
  {label:"Purbachal",sub:"Dhaka · 1461"},
  {label:"Purbachal New Town",sub:"Dhaka · 1461"},
  {label:"300 Feet Purbachal",sub:"Dhaka · 1229"},
  {label:"Kanchpur",sub:"Narayanganj · 1461"},

  // ── CHITTAGONG FULL ──
  {label:"Panchlaish",sub:"Chittagong · 4203"},
  {label:"Khulshi",sub:"Chittagong · 4225"},
  {label:"Khulshi Hill",sub:"Chittagong · 4225"},
  {label:"Agrabad",sub:"Chittagong · 4100"},
  {label:"Nasirabad",sub:"Chittagong · 4210"},
  {label:"Halishahar",sub:"Chittagong · 4216"},
  {label:"Pahartali",sub:"Chittagong · 4202"},
  {label:"Oxygen",sub:"Chittagong · 4209"},
  {label:"GEC Circle",sub:"Chittagong · 4203"},
  {label:"CDA Avenue",sub:"Chittagong · 4203"},
  {label:"Muradpur",sub:"Chittagong · 4210"},
  {label:"Bahaddarhat",sub:"Chittagong · 4210"},
  {label:"Kalurghat",sub:"Chittagong · 4210"},
  {label:"Dewanhat",sub:"Chittagong · 4000"},
  {label:"Kotwali Ctg",sub:"Chittagong · 4000"},
  {label:"Double Mooring",sub:"Chittagong · 4100"},
  {label:"Bandar Ctg",sub:"Chittagong · 4100"},
  {label:"Bayezid",sub:"Chittagong · 4209"},
  {label:"Chandgaon",sub:"Chittagong · 4212"},
  {label:"Bakalia",sub:"Chittagong · 4000"},
  {label:"Sadarghat Ctg",sub:"Chittagong · 4000"},
  {label:"Lalkhan Bazar",sub:"Chittagong · 4000"},
  {label:"Enayet Bazar",sub:"Chittagong · 4000"},
  {label:"Sholoshohor",sub:"Chittagong · 4210"},
  {label:"Dampara",sub:"Chittagong · 4000"},
  {label:"Patharghata",sub:"Chittagong · 4000"},
  {label:"Anderkilla",sub:"Chittagong · 4000"},
  {label:"Chawkbazar Ctg",sub:"Chittagong · 4000"},
  {label:"Jamalkhan",sub:"Chittagong · 4000"},
  {label:"Mohra",sub:"Chittagong · 4217"},
  {label:"Sitakundu",sub:"Chittagong · 4310"},
  {label:"Fatikchari",sub:"Chittagong · 4380"},
  {label:"Hathazari",sub:"Chittagong · 4330"},

  // ── SYLHET FULL ──
  {label:"Sylhet Sadar",sub:"Sylhet · 3100"},
  {label:"Zindabazar",sub:"Sylhet · 3100"},
  {label:"Amberkhana",sub:"Sylhet · 3100"},
  {label:"Subhanighat",sub:"Sylhet · 3100"},
  {label:"Kumarpara",sub:"Sylhet · 3100"},
  {label:"Tilagarh",sub:"Sylhet · 3100"},
  {label:"Shibganj Sylhet",sub:"Sylhet · 3100"},
  {label:"Modina Market",sub:"Sylhet · 3100"},
  {label:"Upashahar",sub:"Sylhet · 3100"},
  {label:"Shahjalal Upashahar",sub:"Sylhet · 3100"},
  {label:"Akhalia",sub:"Sylhet · 3114"},
  {label:"Mirer Maidan",sub:"Sylhet · 3100"},
  {label:"Bondor Bazar",sub:"Sylhet · 3100"},
  {label:"Chowhatta",sub:"Sylhet · 3100"},

  // ── RAJSHAHI ──
  {label:"Rajshahi Sadar",sub:"Rajshahi · 6000"},
  {label:"Boalia",sub:"Rajshahi · 6000"},
  {label:"Shaheb Bazar",sub:"Rajshahi · 6000"},
  {label:"Uposhohor Rajshahi",sub:"Rajshahi · 6000"},
  {label:"Kazla Rajshahi",sub:"Rajshahi · 6000"},
  {label:"Talaimari",sub:"Rajshahi · 6203"},
  {label:"Padma Residential",sub:"Rajshahi · 6000"},
  {label:"New Market Rajshahi",sub:"Rajshahi · 6000"},

  // ── KHULNA ──
  {label:"Khulna Sadar",sub:"Khulna · 9000"},
  {label:"Sonadanga",sub:"Khulna · 9100"},
  {label:"Khalishpur",sub:"Khulna · 9000"},
  {label:"Daulatpur",sub:"Khulna · 9000"},
  {label:"Boyra",sub:"Khulna · 9000"},
  {label:"Nirala",sub:"Khulna · 9100"},
  {label:"Shibbari",sub:"Khulna · 9000"},
  {label:"KDA Avenue Khulna",sub:"Khulna · 9100"},
  {label:"Rupsha",sub:"Khulna · 9000"},

  // ── BARISHAL ──
  {label:"Barishal Sadar",sub:"Barishal · 8200"},
  {label:"Natullabad",sub:"Barishal · 8200"},
  {label:"Band Road",sub:"Barishal · 8200"},
  {label:"Ruplal",sub:"Barishal · 8200"},
  {label:"Sadar Road Barishal",sub:"Barishal · 8200"},
  {label:"Kaunia",sub:"Barishal · 8200"},

  // ── RANGPUR ──
  {label:"Rangpur Sadar",sub:"Rangpur · 5400"},
  {label:"Shapla Chottor",sub:"Rangpur · 5400"},
  {label:"Dhap",sub:"Rangpur · 5400"},
  {label:"Lalbag Rangpur",sub:"Rangpur · 5400"},
  {label:"Jail Road Rangpur",sub:"Rangpur · 5400"},

  // ── MYMENSINGH ──
  {label:"Mymensingh Sadar",sub:"Mymensingh · 2200"},
  {label:"Ganginar Par",sub:"Mymensingh · 2200"},
  {label:"Chorpara",sub:"Mymensingh · 2200"},
  {label:"Kewatkhali",sub:"Mymensingh · 2200"},
  {label:"Masua",sub:"Mymensingh · 2200"},
  {label:"Town Hall Mymensingh",sub:"Mymensingh · 2200"},

  // ── DSCC WARD AREAS (official Dhaka South areas) ──
  {label:"Goran",sub:"Dhaka · 1219"},
  {label:"Meradia",sub:"Dhaka · 1219"},
  {label:"Madartek",sub:"Dhaka · 1219"},
  {label:"Mayakanon",sub:"Dhaka · 1214"},
  {label:"Ahmed Bagh",sub:"Dhaka · 1214"},
  {label:"Kodomtola",sub:"Dhaka · 1214"},
  {label:"Tallabagh",sub:"Dhaka · 1205"},
  {label:"Shukrabad",sub:"Dhaka · 1207"},
  {label:"Green Road",sub:"Dhaka · 1205"},
  {label:"Free School Street",sub:"Dhaka · 1205"},
  {label:"Crescent Road",sub:"Dhaka · 1205"},
  {label:"Central Road",sub:"Dhaka · 1000"},
  {label:"Bailey Road",sub:"Dhaka · 1000"},
  {label:"Bailey Square",sub:"Dhaka · 1000"},
  {label:"Maghbazar",sub:"Dhaka · 1217"},
  {label:"Mogbazar",sub:"Dhaka · 1217"},
  {label:"Ispahani Colony",sub:"Dhaka · 1217"},
  {label:"New Eskaton",sub:"Dhaka · 1000"},
  {label:"Iskaton Garden",sub:"Dhaka · 1000"},
  {label:"Circuit House Road",sub:"Dhaka · 1000"},
  {label:"Mintu Road",sub:"Dhaka · 1000"},
  {label:"Siddeshwari",sub:"Dhaka · 1217"},
  {label:"Siddeshwari Road",sub:"Dhaka · 1217"},
  {label:"DIT Colony",sub:"Dhaka · 1217"},
  {label:"Shahbagh",sub:"Dhaka · 1000"},
  {label:"TSC Area",sub:"Dhaka · 1000"},
  {label:"Dhaka University Area",sub:"Dhaka · 1000"},
  {label:"Nilkhet Babupara",sub:"Dhaka · 1205"},
  {label:"Azimpur",sub:"Dhaka · 1205"},
  {label:"Azimpur Colony",sub:"Dhaka · 1205"},
  {label:"Elephant Road",sub:"Dhaka · 1205"},
  {label:"New Elephant Road",sub:"Dhaka · 1205"},
  {label:"Pilkhana",sub:"Dhaka · 1205"},
  {label:"Mirpur Road",sub:"Dhaka · 1216"},
  {label:"Kamalapur",sub:"Dhaka · 1000"},
  {label:"Kamalapur Railway",sub:"Dhaka · 1000"},
  {label:"RK Mission Road",sub:"Dhaka · 1203"},
  {label:"Gopibagh",sub:"Dhaka · 1203"},
  {label:"Golapbagh",sub:"Dhaka · 1214"},
  {label:"Juribari",sub:"Dhaka · 1214"},
  {label:"Razarbagh",sub:"Dhaka · 1217"},
  {label:"Rajarbagh Police Lines",sub:"Dhaka · 1217"},
  {label:"Bangshal Road",sub:"Dhaka · 1100"},
  {label:"English Road",sub:"Dhaka · 1100"},
  {label:"Nawab Katara",sub:"Dhaka · 1100"},
  {label:"Siddique Bazar",sub:"Dhaka · 1100"},
  {label:"Kazi Alauddin Road",sub:"Dhaka · 1100"},
  {label:"Islampur Road",sub:"Dhaka · 1100"},
  {label:"Ahsan Manzil",sub:"Dhaka · 1100"},
  {label:"Lalmohan Poddar Lane",sub:"Dhaka · 1204"},
  {label:"Postagola Bridge",sub:"Dhaka · 1204"},
  {label:"Khalpar",sub:"Dhaka · 1204"},

  // ── DNCC WARD AREAS (Dhaka North) ──
  {label:"WAPDA Colony",sub:"Dhaka · 1216"},
  {label:"Rupnagar Tin Shed",sub:"Dhaka · 1216"},
  {label:"Pallabi WAPDA",sub:"Dhaka · 1216"},
  {label:"Satarkul",sub:"Dhaka · 1212"},
  {label:"Beraid",sub:"Dhaka · 1212"},
  {label:"Banasree",sub:"Dhaka · 1212"},
  {label:"Gabtali",sub:"Dhaka · 1207"},
  {label:"Jhilmil",sub:"Dhaka · 1362"},
  {label:"Jhilmil Residential",sub:"Dhaka · 1362"},
  {label:"Tegharia",sub:"Dhaka · 1362"},
  {label:"Hasnabad",sub:"Dhaka · 1204"},
  {label:"Jinjira",sub:"Dhaka · 1310"},

  // ── ADDITIONAL DHAKA AREAS FROM MAPS ──
  {label:"Kuril",sub:"Dhaka · 1229"},
  {label:"Kuril Bishwa Road",sub:"Dhaka · 1229"},
  {label:"Progati Sarani",sub:"Dhaka · 1229"},
  {label:"Notun Bazar",sub:"Dhaka · 1212"},
  {label:"Merul Badda",sub:"Dhaka · 1212"},
  {label:"Boro Beraid",sub:"Dhaka · 1212"},
  {label:"Choto Beraid",sub:"Dhaka · 1212"},
  {label:"Shajahanpur",sub:"Dhaka · 1217"},
  {label:"Shahjahanpur",sub:"Dhaka · 1217"},
  {label:"North Shahjahanpur",sub:"Dhaka · 1217"},
  {label:"South Shahjahanpur",sub:"Dhaka · 1217"},
  {label:"Maniknagar",sub:"Dhaka · 1203"},
  {label:"North Maniknagar",sub:"Dhaka · 1203"},
  {label:"South Maniknagar",sub:"Dhaka · 1203"},
  {label:"East Maniknagar",sub:"Dhaka · 1203"},
  {label:"Dholpur",sub:"Dhaka · 1203"},
  {label:"Shyampur Bazar",sub:"Dhaka · 1204"},
  {label:"Muktijoddha Nagar",sub:"Dhaka · 1204"},
  {label:"Habib Nagar",sub:"Dhaka · 1204"},
  {label:"Merojnagar",sub:"Dhaka · 1204"},
  {label:"Mohammadnagar",sub:"Dhaka · 1204"},
  {label:"Yunusnagar",sub:"Dhaka · 1204"},
  {label:"Sirajnagar",sub:"Dhaka · 1204"},
  {label:"Sarnai",sub:"Dhaka · 1310"},
  {label:"Sayedabad Bus Terminal",sub:"Dhaka · 1204"},
  {label:"Konapara",sub:"Dhaka · 1204"},
  {label:"Mandail",sub:"Dhaka · 1204"},
  {label:"Green Model Town",sub:"Dhaka · 1219"},
  {label:"Paity",sub:"Dhaka · 1219"},
  {label:"Choto Paity",sub:"Dhaka · 1219"},
  {label:"Block A Mirpur",sub:"Dhaka · 1216"},
  {label:"Block B Mirpur",sub:"Dhaka · 1216"},
  {label:"Block C Mirpur",sub:"Dhaka · 1216"},
  {label:"Block D Mirpur",sub:"Dhaka · 1216"},
  {label:"Block E Mirpur",sub:"Dhaka · 1216"},
  {label:"Senpara Parbata",sub:"Dhaka · 1216"},
  {label:"Bauniabadh",sub:"Dhaka · 1216"},
  {label:"Bawnia",sub:"Dhaka · 1216"},
  {label:"Kallyanpur",sub:"Dhaka · 1207"},
  {label:"North Kallyanpur",sub:"Dhaka · 1207"},
  {label:"West Kallyanpur",sub:"Dhaka · 1207"},
  {label:"South Kallyanpur",sub:"Dhaka · 1207"},
  {label:"Pirerbag",sub:"Dhaka · 1216"},
  {label:"Tolarbag",sub:"Dhaka · 1207"},
  {label:"Senpara",sub:"Dhaka · 1216"},
  {label:"East Senpara",sub:"Dhaka · 1216"},
  {label:"Paikpara",sub:"Dhaka · 1216"},
  {label:"Santibag",sub:"Dhaka · 1217"},
  {label:"Khilbaristek",sub:"Dhaka · 1229"},
  {label:"Vatara Bazar",sub:"Dhaka · 1212"},
  {label:"Nadda",sub:"Dhaka · 1212"},
  {label:"Kalachandpur",sub:"Dhaka · 1212"},
  {label:"Nortun Bazar Gulshan",sub:"Dhaka · 1212"},
  {label:"Shahjadpur Bazar",sub:"Dhaka · 1212"},
  {label:"East Nakhalpara",sub:"Dhaka · 1215"},
  {label:"West Nakhalpara",sub:"Dhaka · 1215"},
  {label:"Tejturi Bazar",sub:"Dhaka · 1215"},
  {label:"Tejgaon Shilpa Elaka",sub:"Dhaka · 1208"},
  {label:"Monipuripara",sub:"Dhaka · 1215"},
  {label:"Aminbazar",sub:"Dhaka · 1340"},
  {label:"Mirpur Zoo",sub:"Dhaka · 1216"},
  {label:"National Zoo",sub:"Dhaka · 1216"},
  {label:"Shia Mosque Area",sub:"Dhaka · 1000"},
  {label:"Thathari Bazar",sub:"Dhaka · 1100"},
  {label:"Tantibazar",sub:"Dhaka · 1100"},
  {label:"Shankharibazar",sub:"Dhaka · 1100"},
  {label:"Badamtali",sub:"Dhaka · 1100"},
  {label:"Dhupkhola",sub:"Dhaka · 1204"},
  {label:"Rayer Bazar Beribadh",sub:"Dhaka · 1209"},
  {label:"Pirerbag Slum",sub:"Dhaka · 1216"},
  {label:"Vashantek",sub:"Dhaka · 1216"},
  {label:"Diabari Turag",sub:"Dhaka · 1230"},

  // ── CHITTAGONG MISSING AREAS ──
  {label:"Iqbal Park",sub:"Chittagong · 4365"},
  {label:"Kanungo Para",sub:"Chittagong · 4363"},
  {label:"Firingee Bazar",sub:"Chittagong · 4000"},
  {label:"Kobi Nazrul Road",sub:"Chittagong · 4000"},
  {label:"Station Road Ctg",sub:"Chittagong · 4000"},
  {label:"Wazedia",sub:"Chittagong · 4203"},
  {label:"Kaptai Rasta",sub:"Chittagong · 4209"},
  {label:"Fatehabad",sub:"Chittagong · 4210"},
  {label:"Bohaddarhat",sub:"Chittagong · 4210"},
  {label:"Chander Hat",sub:"Chittagong · 4366"},
  {label:"EPZ Chittagong",sub:"Chittagong · 4223"},
  {label:"Shah Amanat Bridge",sub:"Chittagong · 4210"},
  {label:"Kumira",sub:"Chittagong · 4314"},
  {label:"Mirsharai",sub:"Chittagong · 4320"},
  {label:"Banskhali",sub:"Chittagong · 4390"},
  {label:"Patiya",sub:"Chittagong · 4370"},
  {label:"Anwara",sub:"Chittagong · 4376"},
  {label:"Raozan",sub:"Chittagong · 4340"},
  {label:"Sandwip",sub:"Chittagong · 4351"},
  {label:"Cox's Bazar",sub:"Cox's Bazar · 4700"},
  {label:"Cox's Bazar Sadar",sub:"Cox's Bazar · 4700"},
  {label:"Teknaf",sub:"Cox's Bazar · 4761"},
  {label:"Ukhia",sub:"Cox's Bazar · 4750"},

  // ── SYLHET MISSING ──
  {label:"Shahporan",sub:"Sylhet · 3114"},
  {label:"Bishwanath",sub:"Sylhet · 3130"},
  {label:"Osmani Nagar",sub:"Sylhet · 3114"},
  {label:"Dakshin Surma",sub:"Sylhet · 3100"},
  {label:"Golapganj",sub:"Sylhet · 3140"},
  {label:"Jalalabad",sub:"Sylhet · 3100"},
  {label:"Sylhet DOHS",sub:"Sylhet · 3100"},
  {label:"Moulvibazar",sub:"Moulvibazar · 3200"},
  {label:"Sreemangal",sub:"Moulvibazar · 3210"},
  {label:"Habiganj",sub:"Habiganj · 3300"},
  {label:"Sunamganj",sub:"Sunamganj · 3000"},

  // ── RAJSHAHI MISSING ──
  {label:"Rajshahi Medical",sub:"Rajshahi · 6000"},
  {label:"Sahebbazar",sub:"Rajshahi · 6000"},
  {label:"Ghoramara",sub:"Rajshahi · 6000"},
  {label:"Binodpur",sub:"Rajshahi · 6203"},
  {label:"Rajpara",sub:"Rajshahi · 6000"},
  {label:"Motihar",sub:"Rajshahi · 6000"},
  {label:"Paba",sub:"Rajshahi · 6260"},
  {label:"Godagari",sub:"Rajshahi · 6280"},
  {label:"Chapai Nawabganj",sub:"Chapai Nawabganj · 6300"},
  {label:"Natore",sub:"Natore · 6400"},
  {label:"Bogura",sub:"Bogura · 5800"},
  {label:"Bogura Sadar",sub:"Bogura · 5800"},
  {label:"Sherpur Bogura",sub:"Bogura · 5840"},

  // ── KHULNA MISSING ──
  {label:"Khulna Medical",sub:"Khulna · 9000"},
  {label:"Ferryghata",sub:"Khulna · 9000"},
  {label:"Shib Bari",sub:"Khulna · 9000"},
  {label:"Khan A Sabur Road",sub:"Khulna · 9100"},
  {label:"Jessore Road Khulna",sub:"Khulna · 9100"},
  {label:"Mongla",sub:"Khulna · 9350"},
  {label:"Bagerhat",sub:"Bagerhat · 9300"},
  {label:"Satkhira",sub:"Satkhira · 9400"},
  {label:"Jashore",sub:"Jashore · 7400"},
  {label:"Jashore Sadar",sub:"Jashore · 7400"},
  {label:"Benapole",sub:"Jashore · 7431"},
  {label:"Kushtia",sub:"Kushtia · 7000"},

  // ── BARISHAL MISSING ──
  {label:"Barishal Medical",sub:"Barishal · 8200"},
  {label:"Chawkbazar Barishal",sub:"Barishal · 8200"},
  {label:"Amtala",sub:"Barishal · 8200"},
  {label:"Notullabad",sub:"Barishal · 8200"},
  {label:"Rupatali",sub:"Barishal · 8200"},
  {label:"Airport Road Barishal",sub:"Barishal · 8200"},
  {label:"Patuakhali",sub:"Patuakhali · 8600"},
  {label:"Bhola",sub:"Bhola · 8300"},
  {label:"Barguna",sub:"Barguna · 8700"},

  // ── RANGPUR MISSING ──
  {label:"Rangpur Medical",sub:"Rangpur · 5400"},
  {label:"Modern More",sub:"Rangpur · 5400"},
  {label:"Jahaj Company More",sub:"Rangpur · 5400"},
  {label:"Khamar More",sub:"Rangpur · 5400"},
  {label:"Dinajpur",sub:"Dinajpur · 5200"},
  {label:"Dinajpur Sadar",sub:"Dinajpur · 5200"},
  {label:"Thakurgaon",sub:"Thakurgaon · 5100"},
  {label:"Panchagarh",sub:"Panchagarh · 5000"},
  {label:"Nilphamari",sub:"Nilphamari · 5300"},
  {label:"Lalmonirhat",sub:"Lalmonirhat · 5500"},
  {label:"Kurigram",sub:"Kurigram · 5600"},
  {label:"Gaibandha",sub:"Gaibandha · 5700"},

  // ── MYMENSINGH MISSING ──
  {label:"Mymensingh Medical",sub:"Mymensingh · 2200"},
  {label:"Notun Bazar Mymensingh",sub:"Mymensingh · 2200"},
  {label:"Brahmaputra River Bank",sub:"Mymensingh · 2200"},
  {label:"Jamalpure",sub:"Jamalpur · 2000"},
  {label:"Sherpur",sub:"Sherpur · 2100"},
  {label:"Netrokona",sub:"Netrokona · 2400"},
  {label:"Kishoreganj",sub:"Kishoreganj · 2300"},

  // ── NARAYANGANJ FULL ──
  {label:"Narayanganj Sadar",sub:"Narayanganj · 1400"},
  {label:"Fatullah",sub:"Narayanganj · 1421"},
  {label:"Siddhirganj",sub:"Narayanganj · 1430"},
  {label:"Sonargaon",sub:"Narayanganj · 1440"},
  {label:"Rupganj",sub:"Narayanganj · 1461"},
  {label:"Bandar Narayanganj",sub:"Narayanganj · 1410"},
  {label:"Araihazar",sub:"Narayanganj · 1450"},

  // ── GAZIPUR FULL ──
  {label:"Gazipur Sadar",sub:"Gazipur · 1700"},
  {label:"Joydebpur",sub:"Gazipur · 1700"},
  {label:"Tongi",sub:"Gazipur · 1712"},
  {label:"Sreepur",sub:"Gazipur · 1740"},
  {label:"Kaliakoir",sub:"Gazipur · 1750"},
  {label:"Kapasia",sub:"Gazipur · 1730"},
  {label:"Board Bazar",sub:"Gazipur · 1703"},
  {label:"Chandra",sub:"Gazipur · 1751"},
  {label:"Bhawal",sub:"Gazipur · 1700"},
  {label:"Mawna",sub:"Gazipur · 1741"},

  // ── COMILLA / CUMILLA ──
  {label:"Comilla Sadar",sub:"Cumilla · 3500"},
  {label:"Cumilla",sub:"Cumilla · 3500"},
  {label:"Kotbari",sub:"Cumilla · 3503"},
  {label:"Brahmanpara",sub:"Cumilla · 3550"},
  {label:"Chandpur",sub:"Chandpur · 3600"},
  {label:"Laksmipur",sub:"Lakshmipur · 3700"},
  {label:"Noakhali",sub:"Noakhali · 3800"},
  {label:"Feni",sub:"Feni · 3900"},
  {label:"Brahmanbaria",sub:"Brahmanbaria · 3400"},
];
const GOV_LINKS = [
  {label:"RAJUK",url:"https://rajuk.gov.bd",icon:"🏛"},{label:"Land Ministry",url:"https://minland.gov.bd",icon:"📜"},
  {label:"e-Porcha",url:"https://eporcha.gov.bd",icon:"🗺"},{label:"NHA",url:"https://nha.gov.bd",icon:"🏠"},
  {label:"CDA Ctg",url:"https://www.cda.gov.bd",icon:"🏙"},{label:"e-Mutation",url:"https://mutation.land.gov.bd",icon:"📋"},
  {label:"NBR Tax",url:"https://nbr.gov.bd",icon:"💰"},{label:"Land Records",url:"https://www.land.gov.bd",icon:"📂"},
  {label:"BRTA",url:"https://brta.gov.bd",icon:"🚗"},{label:"KDA Khulna",url:"https://kda.gov.bd",icon:"🌿"},
];
const QUICK_FILTERS_EN = [
  {label:"🛋 Furnished",key:"furnished"},{label:"🐾 Pet Friendly",key:"pet"},
  {label:"👥 Flatmate",key:"flatmate"},{label:"🚗 Parking",key:"parking"},
  {label:"⚡ Generator",key:"gen"},{label:"❄️ AC",key:"ac"},
  {label:"🏋 Gym/Pool",key:"gym"},{label:"📶 WiFi",key:"wifi"},
];
const QUICK_FILTERS_BN = [
  {label:"🛋 আসবাবসহ",key:"furnished"},{label:"🐾 পোষা প্রাণী",key:"pet"},
  {label:"👥 ফ্ল্যাটমেট",key:"flatmate"},{label:"🚗 পার্কিং",key:"parking"},
  {label:"⚡ জেনারেটর",key:"gen"},{label:"❄️ এসি",key:"ac"},
  {label:"🏋 জিম/পুল",key:"gym"},{label:"📶 ওয়াইফাই",key:"wifi"},
];

/* Convert Western digits to Bengali numerals */
function toBn(str){
  const map={"0":"০","1":"১","2":"২","3":"৩","4":"৪","5":"৫","6":"৬","7":"৭","8":"৮","9":"৯"};
  return String(str).replace(/[0-9]/g,d=>map[d]);
}
function fmtPrice(price,status,lang="en"){
  const perMonth = lang==="bn" ? "/মাস" : "/mo";
  const crore = lang==="bn" ? "কোটি" : "Cr";
  const lac = lang==="bn" ? "লাখ" : "Lac";
  const bn = v => lang==="bn" ? toBn(v) : v;
  if(status==="for-rent") return {main:`৳${bn(price.toLocaleString("en-BD"))}`,sub:perMonth};
  if(price>=10000000) return {main:`৳${bn((price/10000000).toFixed(2))} ${crore}`,sub:""};
  if(price>=100000) return {main:`৳${bn((price/100000).toFixed(1))} ${lac}`,sub:""};
  return {main:`৳${bn(price.toLocaleString("en-BD"))}`,sub:""};
}
function affordBadge(price,lang="en"){
  if(lang==="bn"){
    if(price<=15000) return {text:"💚 সাশ্রয়ী",bg:"#f0fdf4",c:"#166534"};
    if(price<=40000) return {text:"💛 মধ্যম",bg:"#fefce8",c:"#854d0e"};
    return {text:"💎 প্রিমিয়াম",bg:"#fdf1f3",c:"#9f1239"};
  }
  if(price<=15000) return {text:"💚 Budget",bg:"#f0fdf4",c:"#166534"};
  if(price<=40000) return {text:"💛 Mid Range",bg:"#fefce8",c:"#854d0e"};
  return {text:"💎 Premium",bg:"#fdf1f3",c:"#9f1239"};
}

/* ── AUTH MODAL ───────────────────────────────── */
function AuthModal({onClose, onLogin, initialMode="signin"}){
  const isMobile = useIsMobile();
  const [mode,      setMode]      = useState(initialMode);
  const [loginTab,  setLoginTab]  = useState("email");
  const [role,      setRole]      = useState("tenant");
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [phone,     setPhone]     = useState("");
  const [pass,      setPass]      = useState("");
  const [otp,       setOtp]       = useState("");
  const [otpSent,   setOtpSent]   = useState(false);
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);

  const mkUser = (overrides={}) => ({
    id: Date.now().toString(),
    name: name || email.split("@")[0] || "User",
    email, phone, role: mode==="signup"? role : "tenant",
    avatar: (name||email||phone||"U")[0].toUpperCase(),
    ...overrides,
  });

  const submit = async () => {
    setError("");
    // Phone/OTP not enabled yet — guide user to email for now
    if(loginTab!=="email"){
      setError("Phone login is coming soon. Please use email and password for now.");
      return;
    }
    if(!email||!pass){setError("Please fill in email and password.");return;}
    if(mode==="signup"&&!name){setError("Please enter your full name.");return;}
    if(!supabase){setError("Service unavailable. Please try again shortly.");return;}
    setLoading(true);
    try {
      if(mode==="signup"){
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: pass,
          options: { data: { name: name.trim() } }
        });
        if(error){ setError(error.message); setLoading(false); return; }
        // If email confirmation is off, session exists immediately
        if(data.session && data.user){
          onLogin({ id:data.user.id, name:name.trim()||email.split("@")[0], email:data.user.email, phone:"", role:"tenant", avatar:(name||email)[0].toUpperCase() }, true);
          setLoading(false); onClose(); return;
        }
        // If confirmation is on, no session yet
        setLoading(false);
        setError("Account created! Please check your email to confirm, then sign in.");
        setMode("signin");
        return;
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: pass
        });
        if(error){ setError(error.message); setLoading(false); return; }
        const u = data.user;
        const uname = (u.user_metadata && u.user_metadata.name) || u.email.split("@")[0];
        onLogin({ id:u.id, name:uname, email:u.email, phone:"", role:"tenant", avatar:uname[0].toUpperCase() });
        setLoading(false); onClose(); return;
      }
    } catch(e){
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  };

  const sendOtp = async () => {
    if(!phone){setError("Please enter your phone number.");return;}
    setError("");
    setLoading(true);
    await new Promise(r=>setTimeout(r,700));
    setLoading(false);
    setOtpSent(true);
  };

  const googleSignIn = async () => {
    setLoading(true);
    await new Promise(r=>setTimeout(r,700));
    setLoading(false);
    onLogin(mkUser({id:"google-"+Date.now(),name:"Google User",email:"user@gmail.com",avatar:"G"}));
    onClose();
  };

  const facebookSignIn = async () => {
    setLoading(true);
    await new Promise(r=>setTimeout(r,700));
    setLoading(false);
    onLogin(mkUser({id:"fb-"+Date.now(),name:"Facebook User",email:"user@facebook.com",avatar:"f"}));
    onClose();
  };

  const inp = (placeholder, value, onChange, type="text") => (
    <input value={value} onChange={e=>onChange(e.target.value)} type={type} placeholder={placeholder}
      style={{width:"100%",padding:"11px 13px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
  );

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:5000,display:"flex",alignItems:isMobile?"flex-end":"center",justifyContent:"center",padding:isMobile?0:12,overflowY:"auto"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:isMobile?"22px 22px 0 0":22,width:"100%",maxWidth:440,maxHeight:isMobile?"95vh":"none",overflowY:isMobile?"auto":"visible",boxShadow:"0 24px 80px rgba(0,0,0,0.3)",overflow:"hidden",margin:isMobile?"0":"auto"}}>
        <div style={{background:`linear-gradient(135deg,${T.red},#a00d24)`,padding:"22px 26px",position:"relative"}}>
          <button onClick={onClose} style={{position:"absolute",top:14,right:14,background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"50%",width:32,height:32,color:"#fff",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
            <div style={{borderRadius:8,width:34,height:34,overflow:"hidden",flexShrink:0}}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="34" height="34">
                <rect width="512" height="512" rx="110" fill="#0f2d1a"/>
                <circle cx="400" cy="112" r="88" fill="#C8102E"/>
                <rect x="96" y="210" width="320" height="240" rx="6" fill="#ffffff"/>
                <rect x="86" y="198" width="340" height="22" rx="4" fill="#e8e8e8"/>
                <rect x="114" y="224" width="68" height="46" rx="4" fill="#C8102E" opacity="0.85"/>
                <rect x="220" y="224" width="68" height="46" rx="4" fill="#C8102E" opacity="0.85"/>
                <rect x="326" y="224" width="68" height="46" rx="4" fill="#C8102E" opacity="0.85"/>
                <rect x="114" y="294" width="68" height="46" rx="4" fill="#1a6b3c" opacity="0.85"/>
                <rect x="220" y="294" width="68" height="46" rx="4" fill="#1a6b3c" opacity="0.85"/>
                <rect x="326" y="294" width="68" height="46" rx="4" fill="#1a6b3c" opacity="0.85"/>
                <rect x="114" y="362" width="68" height="46" rx="4" fill="#C8102E" opacity="0.85"/>
                <rect x="326" y="362" width="68" height="46" rx="4" fill="#C8102E" opacity="0.85"/>
                <rect x="210" y="406" width="92" height="44" rx="5" fill="#F5C842"/>
                <rect x="76" y="448" width="360" height="8" rx="2" fill="#F5C842"/>
              </svg>
            </div>
            <div style={{fontFamily:"'Playfair Display',serif",fontWeight:900,fontSize:19,color:"#fff"}}>Basha<span style={{color:T.gold}}>.app</span></div>
          </div>
          <div style={{color:"rgba(255,255,255,0.9)",fontSize:13,fontWeight:600}}>
            {mode==="signin"?"Welcome back! Sign in to continue":"Create your free account"}
          </div>
        </div>
        <div style={{padding:"20px 24px"}}>
          <div style={{display:"flex",background:"#f3f4f6",borderRadius:10,padding:4,marginBottom:18,gap:4}}>
            {[["signin","Sign In"],["signup","Register"]].map(([m,label])=>(
              <button key={m} onClick={()=>{setMode(m);setError("");setOtpSent(false);}} style={{flex:1,padding:"8px",border:"none",borderRadius:7,cursor:"pointer",fontWeight:700,fontSize:13,transition:"all .15s",background:mode===m?"#fff":"transparent",color:mode===m?T.red:"#666",boxShadow:mode===m?"0 1px 4px rgba(0,0,0,0.1)":"none"}}>
                {label}
              </button>
            ))}
          </div>
          {mode==="signup" && (
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:800,color:T.muted,letterSpacing:.6,marginBottom:7}}>I AM A:</div>
              <div style={{display:"flex",gap:7}}>
                {[["tenant","🔍 Tenant"],["owner","🏠 Owner"],["agent","👔 Agent"]].map(([r,label])=>(
                  <button key={r} onClick={()=>setRole(r)} style={{flex:1,padding:"8px 4px",border:"2px solid",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:11,borderColor:role===r?T.green:T.border,background:role===r?T.greenL:"#fff",color:role===r?T.green:T.muted}}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {false && (
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            {[["email","📧 Email"],["phone","📱 Mobile OTP"]].map(([t,label])=>(
              <button key={t} onClick={()=>{setLoginTab(t);setError("");setOtpSent(false);}} style={{flex:1,padding:"8px",border:"1.5px solid",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:12,borderColor:loginTab===t?T.red:T.border,background:loginTab===t?T.redL:"#fff",color:loginTab===t?T.red:"#666"}}>
                {label}
              </button>
            ))}
          </div>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
            {mode==="signup" && inp("Full name *",name,setName)}
            {loginTab==="email" ? (
              <>
                {inp("Email address *",email,setEmail,"email")}
                {mode==="signup" && inp("Phone number (01X-XXXXXXXX)",phone,setPhone,"tel")}
                {inp("Password *",pass,setPass,"password")}
              </>
            ) : (
              <>
                <div style={{display:"flex",gap:8}}>
                  <div style={{background:"#f3f4f6",border:`1.5px solid ${T.border}`,borderRadius:9,padding:"11px 12px",fontSize:13,fontWeight:700,color:"#555",whiteSpace:"nowrap"}}>🇧🇩 +880</div>
                  <input value={phone} onChange={e=>setPhone(e.target.value)} type="tel" placeholder="1XXXXXXXXX *"
                    style={{flex:1,padding:"11px 13px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,outline:"none"}}/>
                </div>
                {!otpSent ? (
                  <button onClick={sendOtp} disabled={loading} style={{background:T.green,color:"#fff",border:"none",padding:"11px",borderRadius:9,fontWeight:700,fontSize:13,cursor:"pointer"}}>
                    {loading?"⏳ Sending...":"📤 Send OTP"}
                  </button>
                ) : (
                  <>
                    <div style={{background:T.greenL,border:`1px solid ${T.greenM}`,borderRadius:9,padding:"9px 12px",fontSize:12,color:T.green,fontWeight:600}}>
                      ✅ OTP sent to +880{phone} — check your SMS
                    </div>
                    <input value={otp} onChange={e=>setOtp(e.target.value)} type="number" placeholder="Enter 6-digit OTP *"
                      style={{padding:"11px 13px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,outline:"none",letterSpacing:4,fontWeight:700}}/>
                    <button onClick={()=>{setOtpSent(false);setOtp("");}} style={{background:"transparent",border:"none",fontSize:11,color:T.muted,cursor:"pointer",textAlign:"left"}}>
                      ← Resend OTP
                    </button>
                  </>
                )}
              </>
            )}
          </div>
          {error && <div style={{background:T.redL,border:`1px solid ${T.redM}`,borderRadius:8,padding:"8px 12px",fontSize:12,color:T.red,marginBottom:12,fontWeight:600}}>{error}</div>}
          {(loginTab==="email"||(loginTab==="phone"&&otpSent)) && (
            <button onClick={submit} disabled={loading} style={{width:"100%",background:loading?"#d1d5db":T.red,color:"#fff",border:"none",padding:"13px",borderRadius:11,fontWeight:800,fontSize:15,cursor:loading?"not-allowed":"pointer",marginBottom:14,transition:"background .2s"}}>
              {loading?"⏳ Please wait...":(mode==="signin"?"🔑 Sign In":"🚀 Create Account")}
            </button>
          )}
          {false && (<>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{flex:1,height:1,background:T.border}}/>
            <span style={{fontSize:11,color:T.muted,fontWeight:600}}>OR CONTINUE WITH</span>
            <div style={{flex:1,height:1,background:T.border}}/>
          </div>
          <div style={{display:"flex",gap:10,marginBottom:16}}>
            <button onClick={googleSignIn} disabled={loading} style={{flex:1,background:"#fff",color:"#333",border:`1.5px solid ${T.border}`,padding:"11px 8px",borderRadius:11,fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.7 29.3 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.7 20-21 0-1.3-.1-2.7-.4-4z"/>
                <path fill="#FF3D00" d="M6.3 14.7l7 5.1C15 16.1 19.1 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.5 5.1 29.5 3 24 3 16.3 3 9.6 7.9 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 45c5.2 0 10-1.9 13.6-5l-6.3-5.3C29.3 36.3 26.8 37 24 37c-5.2 0-9.6-3.3-11.2-8l-7 5.4C9.4 40.9 16.2 45 24 45z"/>
                <path fill="#1565C0" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.5l6.3 5.3C41.3 35.5 44 30.2 44 24c0-1.3-.1-2.7-.4-4z"/>
              </svg>
              Google
            </button>
            <button onClick={facebookSignIn} disabled={loading} style={{flex:1,background:"#1877F2",color:"#fff",border:"none",padding:"11px 8px",borderRadius:11,fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"/>
              </svg>
              Facebook
            </button>
          </div>
          </>)}
          <div style={{textAlign:"center",fontSize:12,color:T.muted}}>
            {mode==="signin"
              ?<span>Don't have an account? <span onClick={()=>setMode("signup")} style={{color:T.red,fontWeight:700,cursor:"pointer"}}>Register free →</span></span>
              :<span>Already have an account? <span onClick={()=>setMode("signin")} style={{color:T.red,fontWeight:700,cursor:"pointer"}}>Sign In →</span></span>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── ANALYTICS TAB COMPONENT ──────────────────── */
function AnalyticsTab({myProps, lang="en"}){
  const isBn = lang==="bn";
  const t = (en,bn)=>isBn?bn:en;
  const bn = v => isBn?toBn(v):v;
  const pname = p => isBn&&p.titleBn ? p.titleBn : p.title;
  const stats = Analytics.getStats();
  const maxViews = Math.max(...stats.days.map(d=>d.views), 1);
  const maxSearches = Math.max(...stats.days.map(d=>d.searches), 1);
  const convRate = stats.totalViews>0 ? ((stats.totalEnquiries/stats.totalViews)*100).toFixed(1) : "0.0";
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>

      {/* KPI Cards */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[
          {icon:"👁",val:bn(stats.totalViews||0),label:t("Total Views","মোট ভিউ"),sub:t("All properties","সব সম্পত্তি"),c:T.red,bg:T.redL},
          {icon:"❤️",val:bn(stats.totalSaves||0),label:t("Saved","সেভ করা"),sub:t("Wishlisted","উইশলিস্টে"),c:"#e11d48",bg:"#fff1f2"},
          {icon:"✉️",val:bn(stats.totalEnquiries||0),label:t("Enquiries","জিজ্ঞাসা"),sub:t("Messages sent","বার্তা পাঠানো"),c:T.green,bg:T.greenL},
          {icon:"📊",val:`${bn(convRate)}%`,label:t("Conversion","রূপান্তর"),sub:t("Views → Enquiry","ভিউ → জিজ্ঞাসা"),c:"#7c3aed",bg:"#f5f3ff"},
        ].map(({icon,val,label,sub,c,bg})=>(
          <div key={label} style={{background:bg,borderRadius:12,padding:"14px 12px",textAlign:"center",border:`1px solid ${c}22`}}>
            <div style={{fontSize:22}}>{icon}</div>
            <div style={{fontSize:22,fontWeight:900,color:c,fontFamily:"'Playfair Display',serif",lineHeight:1.1}}>{val}</div>
            <div style={{fontSize:12,fontWeight:700,color:T.text,marginTop:2}}>{label}</div>
            <div style={{fontSize:10,color:T.muted}}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Today snapshot */}
      <div style={{background:"#fff",border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px"}}>
        <div style={{fontWeight:800,fontSize:13,color:T.text,marginBottom:10}}>⚡ {t("Today's Activity","আজকের কার্যকলাপ")}</div>
        <div style={{display:"flex",gap:12}}>
          {[
            {icon:"👁",val:bn(stats.todayViews),label:t("Views today","আজকের ভিউ"),c:T.red},
            {icon:"🔍",val:bn(stats.todaySearches),label:t("Searches today","আজকের সার্চ"),c:T.green},
            {icon:"📅",val:bn(stats.days[6]?stats.days[6].enquiries:0),label:t("Enquiries today","আজকের জিজ্ঞাসা"),c:"#7c3aed"},
          ].map(({icon,val,label,c})=>(
            <div key={label} style={{flex:1,textAlign:"center",background:T.bg,borderRadius:10,padding:"10px 4px"}}>
              <div style={{fontSize:18}}>{icon}</div>
              <div style={{fontSize:20,fontWeight:900,color:c}}>{val}</div>
              <div style={{fontSize:10,color:T.muted,lineHeight:1.3}}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-day Views Bar Chart */}
      <div style={{background:"#fff",border:`1px solid ${T.border}`,borderRadius:12,padding:"14px"}}>
        <div style={{fontWeight:800,fontSize:13,color:T.text,marginBottom:12}}>📈 {t("Views — Last 7 Days","ভিউ — গত ৭ দিন")}</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:6,height:80}}>
          {stats.days.map((d,i)=>(
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div style={{fontSize:9,fontWeight:700,color:T.red}}>{d.views||""}</div>
              <div style={{
                width:"100%",
                height: Math.max((d.views/maxViews)*64, d.views>0?4:2)+"px",
                background:i===6?T.red:T.red+"66",
                borderRadius:"4px 4px 0 0",
                minHeight:"2px",
              }}/>
              <div style={{fontSize:9,color:T.muted,fontWeight:600,textAlign:"center"}}>{d.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-day Searches Bar Chart */}
      <div style={{background:"#fff",border:`1px solid ${T.border}`,borderRadius:12,padding:"14px"}}>
        <div style={{fontWeight:800,fontSize:13,color:T.text,marginBottom:12}}>🔍 {t("Searches — Last 7 Days","সার্চ — গত ৭ দিন")}</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:6,height:80}}>
          {stats.days.map((d,i)=>(
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div style={{fontSize:9,fontWeight:700,color:T.green}}>{d.searches||""}</div>
              <div style={{
                width:"100%",
                height: Math.max((d.searches/maxSearches)*64, d.searches>0?4:2)+"px",
                background:i===6?T.green:T.green+"66",
                borderRadius:"4px 4px 0 0",
                minHeight:"2px",
              }}/>
              <div style={{fontSize:9,color:T.muted,fontWeight:600,textAlign:"center"}}>{d.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Search Terms */}
      {stats.topSearches.length>0 && (
        <div style={{background:"#fff",border:`1px solid ${T.border}`,borderRadius:12,padding:"14px"}}>
          <div style={{fontWeight:800,fontSize:13,color:T.text,marginBottom:10}}>🔥 {t("Top Search Terms","শীর্ষ সার্চ শব্দ")}</div>
          {stats.topSearches.map((s,i)=>{
            const pct = Math.round((s.count/stats.topSearches[0].count)*100);
            const barColor = i===0?T.red:i===1?"#f59e0b":i===2?"#10b981":T.muted;
            const medal = i===0?"🥇":i===1?"🥈":i===2?"🥉":"  ";
            return (
              <div key={s.query} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:12,fontWeight:700,color:T.text,textTransform:"capitalize"}}>
                    {medal} {s.query}
                  </span>
                  <span style={{fontSize:11,color:T.muted,fontWeight:600}}>{bn(s.count)}×</span>
                </div>
                <div style={{height:5,background:"#f0f0f0",borderRadius:10}}>
                  <div style={{height:5,background:barColor,borderRadius:10,width:pct+"%"}}/>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Per Property Breakdown */}
      <div style={{fontWeight:800,fontSize:13,color:T.text,marginBottom:4}}>🏠 {t("Per Property Performance","প্রতি সম্পত্তির পারফরম্যান্স")}</div>
      {myProps.map(p=>{
        const ps = Analytics.getPropStats(p.id);
        const total = ps.views + p.views;
        const saves = ps.saves + p.saves;
        const saveRate = total>0 ? Math.round((saves/total)*100) : 0;
        const pr = fmtPrice(p.price, p.status, lang);
        const saveBarW = Math.min(saveRate*3,100)+"%";
        return (
          <div key={p.id} style={{background:"#fff",border:`1px solid ${T.border}`,borderRadius:13,overflow:"hidden",marginBottom:4}}>
            <div style={{display:"flex"}}>
              <img src={p.img||PHOTO_PLACEHOLDER} alt={pname(p)} style={{width:80,height:70,objectFit:"cover",flexShrink:0}}/>
              <div style={{padding:"8px 12px",flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:T.text,lineHeight:1.3,marginBottom:1}}>{pname(p)}</div>
                <div style={{fontSize:13,fontWeight:900,color:T.red}}>{pr.main}<span style={{fontSize:10,color:T.muted}}>{pr.sub}</span></div>
              </div>
            </div>
            <div style={{padding:"10px 12px",borderTop:`1px solid ${T.border}`,background:"#fafafa"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:8}}>
                {[
                  {icon:"👁",val:bn(total),label:t("Views","ভিউ"),c:T.red},
                  {icon:"❤️",val:bn(saves),label:t("Saves","সেভ"),c:"#e11d48"},
                  {icon:"✉️",val:bn(ps.enquiries),label:t("Enquiries","জিজ্ঞাসা"),c:T.green},
                  {icon:"📅",val:bn(ps.inspections),label:t("Booked","বুকড"),c:"#7c3aed"},
                ].map(({icon,val,label,c})=>(
                  <div key={label} style={{textAlign:"center",background:"#fff",borderRadius:8,padding:"6px 4px",border:`1px solid ${T.border}`}}>
                    <div style={{fontSize:14}}>{icon}</div>
                    <div style={{fontSize:15,fontWeight:900,color:c}}>{val}</div>
                    <div style={{fontSize:9,color:T.muted}}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{fontSize:10,color:T.muted,whiteSpace:"nowrap"}}>{t("Save rate","সেভ রেট")}</div>
                <div style={{flex:1,height:5,background:"#f0f0f0",borderRadius:10}}>
                  <div style={{height:5,background:saveRate>10?T.green:"#f59e0b",borderRadius:10,width:saveBarW}}/>
                </div>
                <div style={{fontSize:10,fontWeight:700,color:T.text}}>{bn(saveRate)}%</div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Tip */}
      <div style={{background:T.greenL,border:`1px solid ${T.greenM}`,borderRadius:11,padding:"11px 13px",fontSize:11,color:T.green,fontWeight:600}}>
        {stats.totalViews===0
          ? t("💡 No data yet — analytics will appear as tenants view, save and enquire about properties.","💡 এখনো কোনো ডেটা নেই — ভাড়াটিয়ারা সম্পত্তি দেখা, সেভ ও জিজ্ঞাসা করলে বিশ্লেষণ এখানে দেখা যাবে।")
          : t("💡 Analytics update in real time as tenants view, save and enquire about your properties.","💡 ভাড়াটিয়ারা আপনার সম্পত্তি দেখা, সেভ ও জিজ্ঞাসা করার সাথে সাথে বিশ্লেষণ রিয়েল-টাইমে আপডেট হয়।")}
      </div>

    </div>
  );
}

/* ── OWNER DASHBOARD ──────────────────────────── */
const ADMIN_EMAIL = "monjur111@gmail.com";

function OwnerDashboard({user, onClose, onLogout, onSwitchToTenant, onListProperty, savedProps, userProps=[], onDeleteProperty, onEditProperty, lang="en", L}){
  const isMobile = useIsMobile();
  const isBn = lang==="bn";
  const t = (en,bn)=>isBn?bn:en;
  const isAdmin = user.email && user.email.toLowerCase() === ADMIN_EMAIL;
  const [tab, setTab] = useState("listings");
  const myEmail = (user.email||"").toLowerCase();
  const myUserProps = isAdmin ? userProps : userProps.filter(p => (p.ownerEmail||"").toLowerCase() === myEmail);
  const myProps = [...myUserProps, ...PROPERTIES.filter(p=>p.ownerId==="owner1")];
  const pname = p => isBn&&p.titleBn ? p.titleBn : p.title;

  const mockMessages = [
    {id:1,from:t("Karim Ahmed","করিম আহমেদ"),phone:"01711-111111",property:t("Spacious 3-Bed in Bashundhara R/A","বসুন্ধরা আবাসিকে প্রশস্ত ৩ বেড"),subject:t("Inspection request","পরিদর্শনের অনুরোধ"),body:t("Hi, I'd like to visit this Saturday at 10am if possible.","আসসালামু আলাইকুম, সম্ভব হলে আমি এই শনিবার সকাল ১০টায় দেখতে চাই।"),date:t("Today","আজ"),read:false},
    {id:2,from:t("Fatima Begum","ফাতিমা বেগম"),phone:"01811-222222",property:t("Modern Studio near Gulshan 1","গুলশান ১-এর কাছে আধুনিক স্টুডিও"),subject:t("Question about rent","ভাড়া সম্পর্কে প্রশ্ন"),body:t("Is the WiFi included? Also can I move in on 1st June?","ওয়াইফাই কি অন্তর্ভুক্ত? আমি কি ১লা জুন উঠতে পারব?"),date:t("Yesterday","গতকাল"),read:true},
    {id:3,from:t("Rashed Khan","রাশেদ খান"),phone:"01911-333333",property:t("Luxury Penthouse, Baridhara","বারিধারায় লাক্সারি পেন্টহাউস"),subject:t("Interested in long lease","দীর্ঘমেয়াদী লিজে আগ্রহী"),body:t("Looking for 2-year lease. Can we discuss terms?","২ বছরের লিজ খুঁজছি। আমরা কি শর্তগুলো নিয়ে আলোচনা করতে পারি?"),date:t("2 days ago","২ দিন আগে"),read:false},
  ];
  const mockBookings = [
    {id:1,tenant:t("Karim Ahmed","করিম আহমেদ"),phone:"01711-111111",property:t("Spacious 3-Bed in Bashundhara R/A","বসুন্ধরা আবাসিকে প্রশস্ত ৩ বেড"),slot:t("Sat 31 May — 10:00 AM","শনি ৩১ মে — সকাল ১০:০০"),status:"pending"},
    {id:2,tenant:t("Nusrat Jahan","নুসরাত জাহান"),phone:"01611-444444",property:t("Luxury Penthouse, Baridhara","বারিধারায় লাক্সারি পেন্টহাউস"),slot:t("By appointment","অ্যাপয়েন্টমেন্টে"),status:"confirmed"},
  ];

  const totalViews = myProps.reduce((a,p)=>a+p.views,0);
  const totalSaves = myProps.reduce((a,p)=>a+p.saves,0);
  const unreadMsgs = mockMessages.filter(m=>!m.read).length;

  const tabs = [["listings",t("🏠 My Listings","🏠 আমার তালিকা")],["messages",t("✉️ Messages","✉️ বার্তা")+(unreadMsgs>0?` (${isBn?toBn(unreadMsgs):unreadMsgs})`:"")],["bookings",t("📅 Inspections","📅 পরিদর্শন")],["analytics",t("📊 Analytics","📊 বিশ্লেষণ")]];
  if(isAdmin) tabs.push(["admin",t("🛡 Admin","🛡 অ্যাডমিন")]);

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:4000,display:"flex",alignItems:"flex-start",justifyContent:"flex-end",padding:0}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",width:"100%",maxWidth:560,height:"100vh",overflowY:"auto",boxShadow:"-8px 0 40px rgba(0,0,0,0.2)",display:"flex",flexDirection:"column"}}>
        <div style={{background:`linear-gradient(135deg,${T.green},#0a3d22)`,padding:"20px 22px",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:46,height:46,background:"rgba(255,255,255,0.2)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:20}}>{user.avatar}</div>
              <div>
                <div style={{color:"#fff",fontWeight:800,fontSize:16}}>{user.name}</div>
                <div style={{color:"rgba(255,255,255,0.75)",fontSize:12}}>{user.email} · {user.role==="agent"?`👔 ${t("Agent","এজেন্ট")}`:`🏠 ${t("Owner","মালিক")}`}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {onLogout&&<button onClick={onLogout} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:9,padding:"6px 12px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>{t("Sign Out","সাইন আউট")}</button>}
              <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:32,height:32,color:"#fff",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {[[myProps.length,t("Listings","তালিকা"),"🏠"],[totalViews,t("Views","ভিউ"),"👁"],[totalSaves,t("Saved","সেভ"),"❤️"],[unreadMsgs,t("New Msgs","নতুন বার্তা"),"✉️"]].map(([val,label,icon])=>(
              <div key={label} style={{background:"rgba(255,255,255,0.12)",borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                <div style={{fontSize:20}}>{icon}</div>
                <div style={{color:"#fff",fontWeight:900,fontSize:18,lineHeight:1}}>{isBn?toBn(val):val}</div>
                <div style={{color:"rgba(255,255,255,0.7)",fontSize:10,marginTop:2}}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <button onClick={onListProperty} style={{margin:"14px 16px 0",background:T.gold,color:"#1a2e22",border:"none",padding:"11px",borderRadius:11,fontWeight:900,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          ➕ {t("Add New Property Listing","নতুন সম্পত্তি তালিকা যোগ করুন")}
        </button>
        {onSwitchToTenant&&(
          <button onClick={onSwitchToTenant} style={{margin:"10px 16px 0",background:T.redL,color:T.red,border:`1.5px solid ${T.redM}`,padding:"10px",borderRadius:11,fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            🔍 {t("Switch to Find Property","সম্পত্তি খোঁজায় যান")}
          </button>
        )}
        <div style={{display:"flex",borderBottom:`2px solid ${T.border}`,margin:"14px 0 0",flexShrink:0,overflowX:"auto"}}>
          {tabs.map(([val,label])=>(
            <button key={val} onClick={()=>setTab(val)} style={{padding:"9px 14px",border:"none",background:"transparent",cursor:"pointer",fontWeight:700,fontSize:12,whiteSpace:"nowrap",color:tab===val?T.green:T.muted,borderBottom:tab===val?`2.5px solid ${T.green}`:"2.5px solid transparent",marginBottom:-2}}>
              {label}
            </button>
          ))}
        </div>
        <div style={{padding:"16px",flex:1}}>
          {tab==="listings" && (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {myProps.map(p=>{
                const pr=fmtPrice(p.price,p.status,lang);
                return (
                  <div key={p.id} style={{background:"#fff",border:`1px solid ${T.border}`,borderRadius:13,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
                    <div style={{display:"flex",gap:0}}>
                      <img src={p.img||PHOTO_PLACEHOLDER} alt={pname(p)} style={{width:100,height:90,objectFit:"cover",flexShrink:0}}/>
                      <div style={{padding:"10px 12px",flex:1}}>
                        <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:2,lineHeight:1.3}}>{pname(p)}</div>
                        <div style={{fontSize:14,fontWeight:900,color:T.red,fontFamily:"'Playfair Display',serif"}}>{pr.main}<span style={{fontSize:11,color:T.muted}}>{pr.sub}</span></div>
                        <div style={{fontSize:11,color:T.muted,marginTop:3}}>📍 {p.location}</div>
                      </div>
                    </div>
                    <div style={{borderTop:`1px solid ${T.border}`,padding:"8px 12px",display:"flex",gap:16,background:"#fafafa"}}>
                      <span style={{fontSize:11,color:T.muted}}>👁 <strong style={{color:T.text}}>{isBn?toBn(p.views):p.views}</strong> {t("views","ভিউ")}</span>
                      <span style={{fontSize:11,color:T.muted}}>❤️ <strong style={{color:T.red}}>{isBn?toBn(p.saves):p.saves}</strong> {t("saves","সেভ")}</span>
                      <span style={{fontSize:11,color:T.muted}}>📅 <strong style={{color:T.green}}>{isBn?toBn(p.inspSlots.length):p.inspSlots.length}</strong> {t("inspect slots","টি পরিদর্শন সময়")}</span>
                      <span style={{marginLeft:"auto",fontSize:10,background:p.status==="for-rent"?T.greenL:T.redL,color:p.status==="for-rent"?T.green:T.red,padding:"2px 8px",borderRadius:8,fontWeight:700}}>{p.status==="for-rent"?L.forRent:L.forSale}</span>
                    </div>
                    {(isAdmin || (p.ownerEmail||"").toLowerCase()===myEmail) && userProps.some(up=>up.id===p.id) && (
                      <div style={{borderTop:`1px solid ${T.border}`,padding:"8px 12px",display:"flex",gap:8}}>
                        <button onClick={()=>{ if(onEditProperty) onEditProperty(p); }} style={{flex:1,background:T.greenL,color:T.green,border:`1px solid ${T.greenM}`,padding:"8px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer"}}>✏️ {t("Edit","সম্পাদনা")}</button>
                        <button onClick={()=>{ if(window.confirm(t("Delete this listing? This cannot be undone.","এই তালিকা মুছবেন? এটি ফেরানো যাবে না।"))){ if(onDeleteProperty) onDeleteProperty(p.id); } }} style={{flex:1,background:T.redL,color:T.red,border:`1px solid ${T.redM}`,padding:"8px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer"}}>🗑 {t("Delete","মুছুন")}</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {tab==="messages" && (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {mockMessages.map(m=>(
                <div key={m.id} style={{background:"#fff",border:`1.5px solid ${m.read?T.border:T.green}`,borderRadius:12,padding:"13px 14px",boxShadow:m.read?"none":"0 2px 10px rgba(26,107,60,0.1)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:34,height:34,background:m.read?T.bg:T.greenL,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:14,color:m.read?T.muted:T.green}}>{m.from[0]}</div>
                      <div>
                        <div style={{fontWeight:700,fontSize:13,color:T.text}}>{m.from}</div>
                        <div style={{fontSize:11,color:T.muted}}>{m.phone}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                      <span style={{fontSize:10,color:T.muted}}>{m.date}</span>
                      {!m.read && <span style={{background:T.green,color:"#fff",fontSize:9,padding:"1px 6px",borderRadius:8,fontWeight:700}}>{t("NEW","নতুন")}</span>}
                    </div>
                  </div>
                  <div style={{fontSize:11,color:T.green,fontWeight:600,marginBottom:3}}>{t("Re:","বিষয়:")} {m.property}</div>
                  <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:3}}>{m.subject}</div>
                  <div style={{fontSize:12,color:T.muted,lineHeight:1.5}}>{m.body}</div>
                  <div style={{display:"flex",gap:8,marginTop:10}}>
                    <button style={{flex:1,background:T.green,color:"#fff",border:"none",padding:"8px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer"}}>📞 {t("Call Back","কল ব্যাক")}</button>
                    <button style={{flex:1,background:T.greenL,color:T.green,border:`1px solid ${T.greenM}`,padding:"8px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer"}}>✉️ {t("Reply","উত্তর")}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab==="bookings" && (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {mockBookings.map(b=>(
                <div key={b.id} style={{background:"#fff",border:`1px solid ${T.border}`,borderRadius:12,padding:"14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div>
                      <div style={{fontWeight:800,fontSize:14,color:T.text}}>{b.tenant}</div>
                      <div style={{fontSize:12,color:T.muted}}>{b.phone}</div>
                    </div>
                    <span style={{background:b.status==="confirmed"?T.greenL:T.redL,color:b.status==="confirmed"?T.green:T.red,fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,border:`1px solid ${b.status==="confirmed"?T.greenM:T.redM}`}}>
                      {b.status==="confirmed"?t("✅ Confirmed","✅ নিশ্চিত"):t("⏳ Pending","⏳ অপেক্ষমাণ")}
                    </span>
                  </div>
                  <div style={{fontSize:12,color:T.green,fontWeight:600,marginBottom:4}}>🏠 {b.property}</div>
                  <div style={{fontSize:12,color:T.muted}}>📅 {b.slot}</div>
                  {b.status==="pending" && (
                    <div style={{display:"flex",gap:8,marginTop:10}}>
                      <button style={{flex:1,background:T.green,color:"#fff",border:"none",padding:"8px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer"}}>✅ {t("Confirm","নিশ্চিত করুন")}</button>
                      <button style={{flex:1,background:T.redL,color:T.red,border:`1px solid ${T.redM}`,padding:"8px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer"}}>✕ {t("Decline","প্রত্যাখ্যান")}</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {tab==="analytics" && <AnalyticsTab myProps={myProps} lang={lang}/>}
          {tab==="admin" && isAdmin && <AdminPanel lang={lang}/>}
        </div>
      </div>
    </div>
  );
}

/* ── TENANT DASHBOARD ─────────────────────────── */
function TenantDashboard({user, onClose, onLogout, onSwitchToOwner, savedIds, onUnsave, searchHistory, lang="en", L}){
  const isMobile = useIsMobile();
  const isBn = lang==="bn";
  const t = (en,bn)=>isBn?bn:en;
  const pname = p => isBn&&p.titleBn ? p.titleBn : p.title;
  const [tab, setTab] = useState("saved");
  const saved = PROPERTIES.filter(p=>savedIds.includes(p.id));

  const mockBookings = [
    {id:1,property:t("Spacious 3-Bed in Bashundhara R/A","বসুন্ধরা আবাসিকে প্রশস্ত ৩ বেড"),slot:t("Sat 31 May — 10:00 AM","শনি ৩১ মে — সকাল ১০:০০"),status:"confirmed",agent:t("Rahim & Sons","রহিম অ্যান্ড সন্স"),phone:"01711-234567"},
    {id:2,property:t("Modern Studio near Gulshan 1","গুলশান ১-এর কাছে আধুনিক স্টুডিও"),slot:t("Sun 1 Jun — 10:00 AM","রবি ১ জুন — সকাল ১০:০০"),status:"pending",agent:t("Home Finders BD","হোম ফাইন্ডার্স বিডি"),phone:"01811-345678"},
  ];
  const mockMessages = [
    {id:1,to:t("Rahim & Sons","রহিম অ্যান্ড সন্স"),property:t("Spacious 3-Bed in Bashundhara R/A","বসুন্ধরা আবাসিকে প্রশস্ত ৩ বেড"),subject:t("Inspection request","পরিদর্শনের অনুরোধ"),date:t("Today","আজ"),status:"replied"},
    {id:2,to:t("Home Finders BD","হোম ফাইন্ডার্স বিডি"),property:t("Modern Studio near Gulshan 1","গুলশান ১-এর কাছে আধুনিক স্টুডিও"),subject:t("Question about rent","ভাড়া সম্পর্কে প্রশ্ন"),date:t("Yesterday","গতকাল"),status:"sent"},
  ];

  const savedTypes   = [...new Set(saved.map(p=>p.type))];
  const savedDivs    = [...new Set(saved.map(p=>p.division))];
  const avgPrice     = saved.length>0 ? Math.round(saved.reduce((a,p)=>a+p.price,0)/saved.length) : 30000;
  const suggestions  = PROPERTIES.filter(p=>
    !savedIds.includes(p.id) &&
    (savedTypes.includes(p.type)||savedDivs.includes(p.division)) &&
    Math.abs(p.price-avgPrice)/avgPrice<0.5
  ).slice(0,3);

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:4000,display:"flex",alignItems:"flex-start",justifyContent:"flex-end"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",width:"100%",maxWidth:520,height:"100vh",overflowY:"auto",boxShadow:"-8px 0 40px rgba(0,0,0,0.2)",display:"flex",flexDirection:"column"}}>
        <div style={{background:`linear-gradient(135deg,${T.red},#a00d24)`,padding:"20px 22px",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:46,height:46,background:"rgba(255,255,255,0.2)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:20}}>{user.avatar}</div>
              <div>
                <div style={{color:"#fff",fontWeight:800,fontSize:16}}>{user.name}</div>
                <div style={{color:"rgba(255,255,255,0.75)",fontSize:12}}>{user.email} · 🔍 {t("Tenant","ভাড়াটিয়া")}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {onLogout&&<button onClick={onLogout} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:9,padding:"6px 12px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>{t("Sign Out","সাইন আউট")}</button>}
              <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:32,height:32,color:"#fff",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {[[saved.length,t("Saved","সেভ"),"❤️"],[mockBookings.length,t("Bookings","বুকিং"),"📅"],[mockMessages.length,t("Messages","বার্তা"),"✉️"],[suggestions.length,t("Suggestions","পরামর্শ"),"✨"]].map(([val,label,icon])=>(
              <div key={label} style={{background:"rgba(255,255,255,0.12)",borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                <div style={{fontSize:20}}>{icon}</div>
                <div style={{color:"#fff",fontWeight:900,fontSize:18,lineHeight:1}}>{isBn?toBn(val):val}</div>
                <div style={{color:"rgba(255,255,255,0.7)",fontSize:10,marginTop:2}}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        {onSwitchToOwner&&(
          <button onClick={onSwitchToOwner} style={{margin:"12px 16px 0",background:T.greenL,color:T.green,border:`1.5px solid ${T.greenM}`,padding:"10px",borderRadius:11,fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            🏠 {t("Switch to List a Property","সম্পত্তি তালিকায় যান")}
          </button>
        )}
        <div style={{display:"flex",borderBottom:`2px solid ${T.border}`,flexShrink:0,overflowX:"auto",marginTop:12}}>
          {[["saved",t("❤️ Saved","❤️ সেভ")],["bookings",t("📅 Bookings","📅 বুকিং")],["messages",t("✉️ Messages","✉️ বার্তা")],["suggestions",t("✨ For You","✨ আপনার জন্য")],["history",t("🕓 History","🕓 ইতিহাস")]].map(([val,label])=>(
            <button key={val} onClick={()=>setTab(val)} style={{padding:"9px 12px",border:"none",background:"transparent",cursor:"pointer",fontWeight:700,fontSize:11,whiteSpace:"nowrap",color:tab===val?T.red:T.muted,borderBottom:tab===val?`2.5px solid ${T.red}`:"2.5px solid transparent",marginBottom:-2}}>
              {label}
            </button>
          ))}
        </div>
        <div style={{padding:"16px",flex:1}}>
          {tab==="saved" && (
            <div>
              {saved.length===0 ? (
                <div style={{textAlign:"center",padding:"40px 0",color:T.muted}}>
                  <div style={{fontSize:40,marginBottom:10}}>🤍</div>
                  <div style={{fontWeight:700}}>{t("No saved properties yet","এখনো কোনো সেভ করা সম্পত্তি নেই")}</div>
                  <div style={{fontSize:12,marginTop:4}}>{t("Tap the heart on any property to save it","সেভ করতে যেকোনো সম্পত্তির হার্টে ট্যাপ করুন")}</div>
                </div>
              ) : saved.map(p=>{
                const pr=fmtPrice(p.price,p.status,lang);
                return (
                  <div key={p.id} style={{background:"#fff",border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden",marginBottom:10,display:"flex",gap:0}}>
                    <img src={p.img||PHOTO_PLACEHOLDER} alt={pname(p)} style={{width:90,height:80,objectFit:"cover",flexShrink:0}}/>
                    <div style={{padding:"10px 12px",flex:1}}>
                      <div style={{fontSize:12,fontWeight:700,color:T.text,lineHeight:1.3,marginBottom:2}}>{pname(p)}</div>
                      <div style={{fontSize:14,fontWeight:900,color:T.red,fontFamily:"'Playfair Display',serif"}}>{pr.main}<span style={{fontSize:11,color:T.muted,fontWeight:500}}>{pr.sub}</span></div>
                      <div style={{fontSize:11,color:T.muted,marginTop:2}}>📍 {p.location}</div>
                    </div>
                    <button onClick={()=>onUnsave(p.id)} style={{background:"none",border:"none",padding:"0 12px",cursor:"pointer",color:T.red,fontSize:18,flexShrink:0}}>❤️</button>
                  </div>
                );
              })}
            </div>
          )}
          {tab==="bookings" && (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {mockBookings.map(b=>(
                <div key={b.id} style={{background:"#fff",border:`1px solid ${T.border}`,borderRadius:12,padding:"14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontWeight:700,fontSize:13,color:T.text}}>{b.property}</span>
                    <span style={{background:b.status==="confirmed"?T.greenL:T.redL,color:b.status==="confirmed"?T.green:T.red,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10}}>
                      {b.status==="confirmed"?t("✅ Confirmed","✅ নিশ্চিত"):t("⏳ Pending","⏳ অপেক্ষমাণ")}
                    </span>
                  </div>
                  <div style={{fontSize:12,color:T.muted,marginBottom:3}}>📅 {b.slot}</div>
                  <div style={{fontSize:12,color:T.muted,marginBottom:10}}>🏢 {b.agent} · {b.phone}</div>
                  <button style={{width:"100%",background:T.greenL,color:T.green,border:`1px solid ${T.greenM}`,padding:"8px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer"}}>📞 {t("Call Agent","এজেন্টকে কল করুন")}</button>
                </div>
              ))}
            </div>
          )}
          {tab==="messages" && (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {mockMessages.map(m=>(
                <div key={m.id} style={{background:"#fff",border:`1px solid ${T.border}`,borderRadius:12,padding:"13px 14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <div style={{fontWeight:700,fontSize:13,color:T.text}}>{t("To:","প্রাপক:")} {m.to}</div>
                    <span style={{background:m.status==="replied"?T.greenL:"#fff3e0",color:m.status==="replied"?T.green:"#e65100",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10,border:`1px solid ${m.status==="replied"?T.greenM:"#ffcc80"}`}}>
                      {m.status==="replied"?t("💬 Replied","💬 উত্তর দেওয়া"):t("📤 Sent","📤 পাঠানো")}
                    </span>
                  </div>
                  <div style={{fontSize:11,color:T.green,fontWeight:600,marginBottom:3}}>{t("Re:","বিষয়:")} {m.property}</div>
                  <div style={{fontSize:12,color:T.muted,marginBottom:3}}>{m.subject}</div>
                  <div style={{fontSize:11,color:T.muted}}>{m.date}</div>
                </div>
              ))}
            </div>
          )}
          {tab==="suggestions" && (
            <div>
              <div style={{background:T.redL,border:`1px solid ${T.redM}`,borderRadius:12,padding:"12px 14px",marginBottom:14}}>
                <div style={{fontWeight:800,fontSize:13,color:T.red,marginBottom:3}}>✨ {t("Personalised For You","আপনার জন্য বিশেষায়িত")}</div>
                <div style={{fontSize:12,color:T.muted}}>{t("Based on your saved properties and search history, here are new listings that match your interests:","আপনার সেভ করা সম্পত্তি ও সার্চ ইতিহাসের ভিত্তিতে, আপনার পছন্দের সাথে মানানসই নতুন তালিকা:")}</div>
              </div>
              {suggestions.length>0 ? suggestions.map(p=>{
                const pr=fmtPrice(p.price,p.status,lang);
                const ab=affordBadge(p.price,lang);
                return (
                  <div key={p.id} style={{background:"#fff",border:`1.5px solid ${T.redM}`,borderRadius:12,overflow:"hidden",marginBottom:10}}>
                    <div style={{position:"relative",height:140,overflow:"hidden"}}>
                      <img src={p.img||PHOTO_PLACEHOLDER} alt={pname(p)} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      <div style={{position:"absolute",top:8,left:8}}>
                        <span style={{background:T.red,color:"#fff",fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:12}}>✨ {t("NEW MATCH","নতুন ম্যাচ")}</span>
                      </div>
                      <div style={{position:"absolute",bottom:8,left:8}}>
                        <span style={{background:ab.bg,color:ab.c,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:8}}>{ab.text}</span>
                      </div>
                    </div>
                    <div style={{padding:"10px 12px"}}>
                      <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:2}}>{pname(p)}</div>
                      <div style={{fontSize:16,fontWeight:900,color:T.red,fontFamily:"'Playfair Display',serif"}}>{pr.main}<span style={{fontSize:11,color:T.muted}}>{pr.sub}</span></div>
                      <div style={{fontSize:11,color:T.muted,marginTop:2}}>📍 {p.location}</div>
                    </div>
                  </div>
                );
              }) : (
                <div style={{textAlign:"center",padding:"30px 0",color:T.muted}}>
                  <div style={{fontSize:36,marginBottom:10}}>✨</div>
                  <div style={{fontWeight:700}}>{t("Save some properties first!","প্রথমে কিছু সম্পত্তি সেভ করুন!")}</div>
                  <div style={{fontSize:12,marginTop:4}}>{t("We'll suggest similar listings based on your taste","আপনার রুচি অনুযায়ী আমরা অনুরূপ তালিকা পরামর্শ দেব")}</div>
                </div>
              )}
            </div>
          )}
          {tab==="history" && (
            <div>
              <div style={{fontSize:11,fontWeight:800,color:T.muted,letterSpacing:.6,marginBottom:12}}>{t("RECENT SEARCHES","সাম্প্রতিক সার্চ")}</div>
              {searchHistory.length>0 ? searchHistory.map((s,i)=>(
                <div key={i} style={{background:"#fff",border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:16,color:T.muted}}>🕓</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:T.text}}>{s.query||t("All Properties","সকল সম্পত্তি")}</div>
                    <div style={{fontSize:11,color:T.muted}}>{s.filters} · {s.time}</div>
                  </div>
                  <span style={{fontSize:11,color:T.green,fontWeight:700,cursor:"pointer"}}>{t("Search again →","আবার সার্চ →")}</span>
                </div>
              )) : (
                <div style={{textAlign:"center",padding:"30px 0",color:T.muted}}>
                  <div style={{fontSize:36,marginBottom:10}}>🕓</div>
                  <div style={{fontWeight:700}}>{t("No search history yet","এখনো কোনো সার্চ ইতিহাস নেই")}</div>
                  <div style={{fontSize:12,marginTop:4}}>{t("Your recent searches will appear here","আপনার সাম্প্রতিক সার্চ এখানে দেখা যাবে")}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── PROPERTY CARD ────────────────────────────── */
function Card({p, onSelect, savedIds, onSaveToggle, lang="en", L}){
  const [hov, setHov] = useState(false);
  const saved = savedIds.includes(p.id);
  const pr = fmtPrice(p.price,p.status,lang);
  const ab = p.status==="for-rent" ? affordBadge(p.price,lang) : null;
  const isBn = lang==="bn";
  return (
    <div onClick={()=>onSelect(p)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:"#fff",borderRadius:16,overflow:"hidden",cursor:"pointer",display:"flex",flexDirection:"column",
        boxShadow:hov?"0 12px 40px rgba(0,0,0,0.14)":"0 2px 12px rgba(0,0,0,0.07)",
        border:`1px solid ${hov?"#d1d5db":T.border}`,transform:hov?"translateY(-3px)":"none",transition:"all .2s"}}>
      <div style={{position:"relative",height:188,overflow:"hidden",flexShrink:0}}>
        <img src={p.img||PHOTO_PLACEHOLDER} alt={p.title} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=PHOTO_PLACEHOLDER;}} style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform .4s",transform:hov?"scale(1.05)":"scale(1)"}}/>
        <div style={{position:"absolute",top:10,left:10,display:"flex",gap:5}}>
          <span style={{background:p.status==="for-sale"?T.red:T.green,color:"#fff",fontSize:10,fontWeight:800,padding:"3px 9px",borderRadius:20}}>
            {p.status==="for-sale"?L.forSale:L.forRent}
          </span>
          {p.featured && <span style={{background:T.gold,color:"#111",fontSize:10,fontWeight:800,padding:"3px 9px",borderRadius:20}}>{L.featured}</span>}
        </div>
        <button onClick={e=>{e.stopPropagation();onSaveToggle(p.id);}} style={{
          position:"absolute",top:10,right:10,background:saved?T.red:"rgba(255,255,255,0.92)",
          border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:14,
          display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.18)"}}>
          {saved?"❤️":"🤍"}
        </button>
        <div style={{position:"absolute",bottom:8,left:10,right:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          {ab && <span style={{background:ab.bg,color:ab.c,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:8}}>{ab.text}</span>}
          <span style={{background:"rgba(0,0,0,0.5)",color:"#fff",fontSize:10,padding:"2px 8px",borderRadius:8,marginLeft:"auto"}}>
            {p.age===1?L.today:`${p.age} ${L.daysAgo}`}
          </span>
        </div>
      </div>
      <div style={{padding:"14px 16px 16px",display:"flex",flexDirection:"column",flex:1}}>
        <div style={{display:"flex",alignItems:"baseline",gap:3,marginBottom:3}}>
          <span style={{fontSize:23,fontWeight:900,color:T.red,fontFamily:"'Playfair Display',serif"}}>{pr.main}</span>
          {pr.sub && <span style={{fontSize:12,color:T.muted}}>{pr.sub}</span>}
        </div>
        <div style={{fontSize:15,fontWeight:700,color:T.text,lineHeight:1.3,marginBottom:5}}>{isBn&&p.titleBn?p.titleBn:p.title}</div>
        <div style={{fontSize:13,color:T.muted,marginBottom:9,display:"flex",alignItems:"center",gap:3}}>
          <span style={{color:T.red}}>📍</span>{p.location}
        </div>
        {p.status==="for-rent" && (
          <div style={{display:"flex",gap:5,marginBottom:9,flexWrap:"wrap"}}>
            {p.petFriendly && <span style={{fontSize:11,background:"#f0fdf4",color:"#166534",padding:"3px 8px",borderRadius:7,fontWeight:700}}>{L.petsOk}</span>}
            {p.flatmate    && <span style={{fontSize:11,background:"#eff6ff",color:"#1d4ed8",padding:"3px 8px",borderRadius:7,fontWeight:700}}>{L.flatmate}</span>}
            {p.inspSlots?.length>0 && <span style={{fontSize:11,background:"#fef9c3",color:"#854d0e",padding:"3px 8px",borderRadius:7,fontWeight:700}}>📅 {isBn?toBn(p.inspSlots.length):p.inspSlots.length}{L.inspSlots}</span>}
          </div>
        )}
        <div style={{display:"flex",gap:11,paddingTop:10,borderTop:`1px solid ${T.border}`,marginBottom:10}}>
          {p.beds>0  && <span style={{fontSize:12.5,color:"#555"}}>🛏 {isBn?toBn(p.beds):p.beds} {isBn?"বেড":"Bed"}</span>}
          {p.baths>0 && <span style={{fontSize:12.5,color:"#555"}}>🚿 {isBn?toBn(p.baths):p.baths} {isBn?"বাথ":"Bath"}</span>}
          {p.cars>0  && <span style={{fontSize:12.5,color:"#555"}}>🚗 {isBn?toBn(p.cars):p.cars}</span>}
          {p.floor>0 && <span style={{fontSize:12.5,color:"#555"}}>🏢 {isBn?"":"F"}{isBn?toBn(p.floor):p.floor}{isBn?"তলা":""}</span>}
          <span style={{fontSize:12.5,color:"#555",marginLeft:"auto"}}>📐 {isBn?toBn(p.area.toLocaleString()):p.area.toLocaleString()} {isBn?"বর্গফুট":"sqft"}</span>
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
          {p.tags.slice(0,3).map(tag=>(
            <span key={tag} style={{background:T.redL,color:T.red,fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:9,border:`1px solid ${T.redM}`}}>{tag}</span>
          ))}
        </div>
        <div style={{marginTop:"auto",paddingTop:9,borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:11.5,color:T.muted}}>🏢 {p.agent}</span>
          <span style={{fontSize:11.5,fontWeight:700,color:T.green}}>{p.phone}</span>
        </div>
      </div>
    </div>
  );
}

/* ── DETAIL MODAL ─────────────────────────────── */
function DetailModal({p, onClose, L, lang="en"}){
  const isMobile = useIsMobile();
  const [tab, setTab]              = useState("overview");
  const [selectedSlot, setSlot]    = useState("");
  const [booked, setBooked]        = useState(false);
  const [msgSent, setMsgSent]      = useState(false);
  const [msg, setMsg]              = useState({name:"",phone:"",email:"",subject:"I'd like to schedule an inspection",prefDate:"",prefTime:"Anytime",body:""});
  if(!p) return null;
  const pr = fmtPrice(p.price,p.status,lang);
  const upd=(k,v)=>setMsg(m=>({...m,[k]:v}));
  const inp=(ph,key,type="text")=>(
    <input value={msg[key]} onChange={e=>upd(key,e.target.value)} type={type} placeholder={ph}
      style={{width:"100%",padding:"10px 12px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
  );
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:3000,display:"flex",alignItems:isMobile?"flex-end":"center",justifyContent:"center",padding:isMobile?0:12,overflowY:"auto"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:700,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 24px 80px rgba(0,0,0,0.3)",margin:"auto"}}>
        <div style={{position:"relative",borderRadius:"20px 20px 0 0",overflow:"hidden"}}>
          <img src={p.img||PHOTO_PLACEHOLDER} alt={p.title} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=PHOTO_PLACEHOLDER;}} style={{width:"100%",height:260,objectFit:"cover",display:"block"}}/>
          <button onClick={onClose} style={{position:"absolute",top:10,right:14,background:"#fff",border:"none",borderRadius:"50%",width:36,height:36,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 10px rgba(0,0,0,.25)"}}>✕</button>
          <div style={{position:"absolute",bottom:12,left:14,display:"flex",gap:6}}>
            <span style={{background:p.status==="for-sale"?T.red:T.green,color:"#fff",fontSize:11,fontWeight:800,padding:"4px 12px",borderRadius:20}}>
              {p.status==="for-sale"?"FOR SALE":"FOR RENT"}
            </span>
            {p.featured&&<span style={{background:T.gold,color:"#111",fontSize:11,fontWeight:800,padding:"4px 12px",borderRadius:20}}>{L.featured}</span>}
          </div>
        </div>
        <div style={{padding:"20px 24px 26px"}}>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:26,fontWeight:900,color:T.red,fontFamily:"'Playfair Display',serif",lineHeight:1}}>
              {pr.main}<span style={{fontSize:14,color:T.muted,fontWeight:500}}>{pr.sub}</span>
            </div>
            <div style={{fontSize:16,fontWeight:700,color:T.text,marginTop:5}}>{lang==="bn"&&p.titleBn?p.titleBn:p.title}</div>
            <div style={{color:T.muted,fontSize:12,marginTop:3}}>📍 {p.location} · {p.division}</div>
            <div style={{display:"flex",gap:12,marginTop:6}}>
              <span style={{fontSize:11,color:T.muted}}>👁 {p.views} views</span>
              <span style={{fontSize:11,color:T.red}}>❤️ {p.saves} saves</span>
            </div>
          </div>
          <div style={{display:"flex",borderBottom:`2px solid ${T.border}`,marginBottom:16,overflowX:"auto"}}>
            {[[L.overviewTab,"overview"],[L.utilTab,"utils"],[L.msgTab,"message"],[L.inspTab,"inspect"]].map(([label,val])=>(
              <button key={val} onClick={()=>setTab(val)} style={{padding:"8px 14px",border:"none",background:"transparent",cursor:"pointer",fontWeight:700,fontSize:12,whiteSpace:"nowrap",color:tab===val?T.red:T.muted,borderBottom:tab===val?`2.5px solid ${T.red}`:"2.5px solid transparent",marginBottom:-2}}>
                {label}
              </button>
            ))}
          </div>
          {tab==="overview" && (
            <>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,background:T.border,borderRadius:12,overflow:"hidden",marginBottom:14}}>
                {[p.beds>0&&["🛏",p.beds,L.beds],p.baths>0&&["🚿",p.baths,L.baths],p.cars>0&&["🚗",p.cars,L.cars],["📐",`${p.area.toLocaleString()}`,L.sqft]].filter(Boolean).map(([icon,val,label])=>(
                  <div key={label} style={{background:"#fff",textAlign:"center",padding:"12px 4px"}}>
                    <div style={{fontSize:18}}>{icon}</div><div style={{fontWeight:800,fontSize:14,color:T.text}}>{val}</div><div style={{fontSize:10,color:T.muted}}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
                {p.tags.map(tag=><span key={tag} style={{background:T.redL,color:T.red,fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:10,border:`1px solid ${T.redM}`}}>{tag}</span>)}
                {p.petFriendly&&<span style={{background:"#f0fdf4",color:"#166534",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:10,border:"1px solid #bbf7d0"}}>🐾 Pet Friendly</span>}
                {p.flatmate&&<span style={{background:"#eff6ff",color:"#1d4ed8",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:10,border:"1px solid #bfdbfe"}}>{L.flatmate}</span>}
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
              {p.utilities.length>0?(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
                  {p.utilities.map(u=>(
                    <div key={u} style={{background:T.greenL,border:`1px solid ${T.greenM}`,borderRadius:10,padding:"10px 13px",display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:16}}>✅</span><span style={{fontWeight:600,fontSize:13,color:T.green}}>{u} Included</span>
                    </div>
                  ))}
                </div>
              ):<div style={{color:T.muted,fontSize:14,padding:"20px 0",textAlign:"center"}}>No utilities included.</div>}
            </div>
          )}
          {tab==="message" && (
            <div>
              {msgSent?(
                <div style={{background:T.greenL,border:`1px solid ${T.greenM}`,borderRadius:14,padding:"28px",textAlign:"center"}}>
                  <div style={{fontSize:40,marginBottom:10}}>✅</div>
                  <div style={{fontWeight:800,fontSize:16,color:T.green,marginBottom:6}}>{L.msgSentTitle}</div>
                  <div style={{fontSize:12,color:T.muted}}>Owner <strong>{p.agent}</strong> will reply within 24 hours to {msg.phone}.</div>
                </div>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{inp("Your full name *","name")}{inp("Your phone *","phone")}</div>
                  {inp("Email (optional)","email","email")}
                  <select value={msg.subject} onChange={e=>upd("subject",e.target.value)} style={{padding:"10px 12px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,color:"#444",background:"#fff",outline:"none"}}>
                    {["I'd like to schedule an inspection","Question about this property","Rental application","Other"].map(o=><option key={o}>{o}</option>)}
                  </select>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <input type="date" value={msg.prefDate} onChange={e=>upd("prefDate",e.target.value)} style={{padding:"10px 12px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,outline:"none"}}/>
                    <select value={msg.prefTime} onChange={e=>upd("prefTime",e.target.value)} style={{padding:"10px 12px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,color:"#444",background:"#fff",outline:"none"}}>
                      {["Morning (8am–12pm)","Afternoon (12pm–5pm)","Evening (5pm–8pm)","Anytime"].map(o=><option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <textarea rows={3} value={msg.body} onChange={e=>upd("body",e.target.value)} placeholder="Your message… include move-in date, questions, etc."
                    style={{padding:"10px 12px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,outline:"none",resize:"vertical",fontFamily:"inherit"}}/>
                  <button onClick={async()=>{
                    if(!msg.name||!msg.phone) return;
                    setMsgSent(true);
                    Analytics.track("enquiry", {propId: p.id, title: p.title});
                    try {
                      await fetch("/api/send-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"owner_new_message",data:{ownerEmail:"monjur111@gmail.com",propertyTitle:p.title,senderName:msg.name,senderPhone:msg.phone,senderEmail:msg.email,subject:msg.subject,body:msg.body,prefDate:msg.prefDate,prefTime:msg.prefTime}})});
                    } catch(e){ console.log("Email error:",e); }
                  }} style={{background:T.red,color:"#fff",border:"none",padding:"13px",borderRadius:11,fontWeight:800,fontSize:14,cursor:"pointer"}}>{L.sendMsgBtn}</button>
                </div>
              )}
            </div>
          )}
          {tab==="inspect" && (
            <div>
              {booked?(
                <div style={{background:T.greenL,border:`1px solid ${T.greenM}`,borderRadius:14,padding:"28px",textAlign:"center"}}>
                  <div style={{fontSize:40,marginBottom:10}}>🎉</div>
                  <div style={{fontWeight:800,fontSize:16,color:T.green,marginBottom:4}}>{L.bookedTitle}</div>
                  <div style={{fontSize:12,color:T.muted}}>Time: <strong>{selectedSlot}</strong></div>
                  <div style={{fontSize:12,color:T.muted,marginTop:2}}>Agent: {p.agent} · {p.phone}</div>
                </div>
              ):(
                <>
                  <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>Book an Inspection</div>
                  <div style={{fontSize:12,color:T.muted,marginBottom:14}}>Pick a slot — the owner/agent will confirm your visit.</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
                    {p.inspSlots.map(slot=>(
                      <button key={slot} onClick={()=>setSlot(slot)} style={{padding:"12px 15px",borderRadius:11,border:"2px solid",textAlign:"left",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",borderColor:selectedSlot===slot?T.green:T.border,background:selectedSlot===slot?T.greenL:"#fff"}}>
                        <span style={{fontSize:13,fontWeight:700,color:selectedSlot===slot?T.green:T.text}}>📅 {slot}</span>
                        <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${selectedSlot===slot?T.green:T.border}`,background:selectedSlot===slot?T.green:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          {selectedSlot===slot&&<div style={{width:7,height:7,borderRadius:"50%",background:"#fff"}}/>}
                        </div>
                      </button>
                    ))}
                  </div>
                  <button onClick={async()=>{
                    if(!selectedSlot) return;
                    setBooked(true);
                    Analytics.track("inspection", {propId: p.id, title: p.title, slot: selectedSlot});
                    try {
                      await fetch("/api/send-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"owner_inspection_booked",data:{ownerEmail:"monjur111@gmail.com",propertyTitle:p.title,tenantName:"Tenant",tenantPhone:"—",slot:selectedSlot}})});
                    } catch(e){ console.log("Email error:",e); }
                  }} disabled={!selectedSlot}
                    style={{width:"100%",background:selectedSlot?T.green:"#d1d5db",color:"#fff",border:"none",padding:"13px",borderRadius:11,fontWeight:800,fontSize:14,cursor:selectedSlot?"pointer":"not-allowed"}}>
                    {L.confirmBookBtn}
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

/* ── LISTING WIZARD ───────────────────────────── */
function ListWizard({onClose, onAddArea, onAddProperty, editingProp=null, onEditProperty, customAreas=[]}){
  const isMobile = useIsMobile();
  const [step,setStep]=useState(0);
  const [form,setForm]=useState(()=>{
    const base={type:"apartment",status:"for-rent",title:"",address:"",areaName:"",division:"Dhaka",price:"",beds:"",baths:"",area:"",floor:"",furnished:"unfurnished",avail:"now",availDate:"",inspSlots:[{day:"",time:""}],utils:[],petFriendly:false,flatmate:false,features:[],desc:"",name:"",phone:"",photos:[],coverIdx:0};
    if(editingProp){
      return {...base,
        type:editingProp.type||base.type,
        status:editingProp.status||base.status,
        title:editingProp.title||"",
        areaName:editingProp.location?editingProp.location.split(",")[0]:"",
        division:editingProp.division||base.division,
        price:editingProp.price?String(editingProp.price):"",
        beds:editingProp.beds?String(editingProp.beds):"",
        baths:editingProp.baths?String(editingProp.baths):"",
        area:editingProp.area?String(editingProp.area):"",
        floor:editingProp.floor?String(editingProp.floor):"",
        utils:editingProp.utilities||[],
        petFriendly:!!editingProp.petFriendly,
        flatmate:!!editingProp.flatmate,
        features:editingProp.tags||[],
        desc:editingProp.desc||"",
        name:editingProp.agent||"",
        phone:editingProp.phone||"",
        photos:editingProp.photos||[],
      };
    }
    return base;
  });
  const [areaSugg, setAreaSugg] = useState(false);
  const upd=(k,v)=>setForm(f=>({...f,[k]:v}));
  const toggleArr=(k,v)=>setForm(f=>({...f,[k]:f[k].includes(v)?f[k].filter(x=>x!==v):[...f[k],v]}));
  const addSlot=()=>setForm(f=>({...f,inspSlots:[...f.inspSlots,{day:"",time:""}]}));
  const removeSlot=i=>setForm(f=>({...f,inspSlots:f.inspSlots.filter((_,idx)=>idx!==i)}));
  const updSlot=(i,k,v)=>setForm(f=>({...f,inspSlots:f.inspSlots.map((s,idx)=>idx===i?{...s,[k]:v}:s)}));
  const STEPS=["Property Type","Location & Details","Rental Terms & Inspection","Features","Contact & Publish"];
  const pct=(step/(STEPS.length-1))*100;
  const inp=(ph,key,type="text")=>(
    <input value={form[key]} onChange={e=>upd(key,e.target.value)} type={type} placeholder={ph}
      style={{width:"100%",padding:"10px 12px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
  );
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:4000,display:"flex",alignItems:isMobile?"flex-end":"center",justifyContent:"center",padding:isMobile?0:12,overflowY:"auto"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:isMobile?"22px 22px 0 0":22,width:"100%",maxWidth:600,maxHeight:isMobile?"96vh":"95vh",overflowY:"auto",boxShadow:"0 24px 80px rgba(0,0,0,0.35)",margin:isMobile?"0":"auto"}}>
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
          {step===0&&(
            <div>
              <div style={{fontSize:11,fontWeight:800,color:T.muted,letterSpacing:.6,marginBottom:10}}>PROPERTY TYPE</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:18}}>
                {[["🏢","Apartment","apartment"],["🏠","House","house"],["🛏","Single Room","room"],["🏭","Commercial","commercial"],["🌿","Land / Plot","land"]].map(([icon,label,val])=>(
                  <button key={val} onClick={()=>upd("type",val)} style={{padding:"13px",border:"2px solid",cursor:"pointer",borderRadius:12,display:"flex",flexDirection:"column",alignItems:"center",gap:5,borderColor:form.type===val?T.green:T.border,background:form.type===val?T.greenL:"#fff"}}>
                    <span style={{fontSize:24}}>{icon}</span><span style={{fontSize:12,fontWeight:700,color:form.type===val?T.green:T.text}}>{label}</span>
                  </button>
                ))}
              </div>
              <div style={{fontSize:11,fontWeight:800,color:T.muted,letterSpacing:.6,marginBottom:10}}>LISTING PURPOSE</div>
              <div style={{display:"flex",gap:9}}>
                {[["🔑 For Rent","for-rent"],["🏷 For Sale","for-sale"]].map(([label,val])=>{
                  const active=form.status===val;
                  return <button key={val} onClick={()=>upd("status",val)} style={{flex:1,padding:"11px",border:"2px solid",borderRadius:11,cursor:"pointer",fontWeight:700,fontSize:13,borderColor:active?T.red:T.border,background:active?T.redL:"#fff",color:active?T.red:T.text}}>{label}</button>;
                })}
              </div>
            </div>
          )}
          {step===1&&(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div><div style={{fontSize:11,fontWeight:800,color:T.muted,marginBottom:4}}>PROPERTY TITLE *</div>{inp("e.g. Spacious 3-Bed Flat in Bashundhara R/A","title")}</div>

              {/* ── AREA NAME with live autocomplete + add new ── */}
              <div>
                <div style={{fontSize:11,fontWeight:800,color:T.muted,marginBottom:4}}>AREA NAME *
                  <span style={{fontWeight:500,color:T.green,marginLeft:6,fontSize:10}}>— type to search or add a new area</span>
                </div>
                <div style={{position:"relative"}}>
                  <input
                    value={form.areaName}
                    onChange={e=>{ upd("areaName",e.target.value); setAreaSugg(true); }}
                    onFocus={()=>setAreaSugg(true)}
                    onBlur={()=>setTimeout(()=>setAreaSugg(false),200)}
                    placeholder="e.g. Mirpur 10, Dhanmondi, Bashundhara R/A…"
                    style={{width:"100%",padding:"11px 14px",border:`1.5px solid ${form.areaName?T.green:T.border}`,borderRadius:9,fontSize:13,outline:"none",boxSizing:"border-box"}}
                  />
                  {/* Dropdown */}
                  {areaSugg && form.areaName.length>=1 && (()=>{
                    const allAreas = [
                      ...AREA_SUGGESTIONS,
                      ...customAreas.map(a=>({label:a.label,sub:a.sub,isCustom:true}))
                    ];
                    const matches = allAreas.filter(a=>
                      a.label.toLowerCase().includes(form.areaName.toLowerCase()) ||
                      (a.sub||"").toLowerCase().includes(form.areaName.toLowerCase())
                    ).slice(0,7);
                    const exactMatch = allAreas.some(a=>a.label.toLowerCase()===form.areaName.toLowerCase());
                    return (
                      <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:"#fff",border:`1.5px solid ${T.border}`,borderRadius:10,boxShadow:"0 8px 30px rgba(0,0,0,0.12)",zIndex:999,overflow:"hidden"}}>
                        {matches.map((a,i)=>(
                          <div key={i}
                            onMouseDown={()=>{ upd("areaName",a.label); setAreaSugg(false); }}
                            style={{padding:"10px 14px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${T.border}`,background:"#fff"}}
                            onMouseEnter={e=>e.currentTarget.style.background=T.greenL}
                            onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <span style={{fontSize:13}}>{a.isCustom?"🆕":"📍"}</span>
                              <span style={{fontSize:13,fontWeight:700,color:T.text}}>{a.label}</span>
                            </div>
                            <span style={{fontSize:11,color:T.muted}}>{a.sub}{a.isCustom&&<span style={{marginLeft:6,background:T.greenL,color:T.green,fontSize:9,fontWeight:800,padding:"1px 5px",borderRadius:8}}>USER ADDED</span>}</span>
                          </div>
                        ))}
                        {/* Add new area button */}
                        {!exactMatch && form.areaName.trim().length>=3 && (
                          <div
                            onMouseDown={()=>{
                              const newArea = {
                                label: form.areaName.trim(),
                                sub: `${form.division} · User Added`,
                                isCustom: true,
                                addedAt: new Date().toISOString(),
                              };
                              onAddArea(newArea);
                              setAreaSugg(false);
                            }}
                            style={{padding:"11px 14px",cursor:"pointer",background:T.greenL,display:"flex",alignItems:"center",gap:10,borderTop:`1px solid ${T.greenM}`}}
                            onMouseEnter={e=>e.currentTarget.style.background=T.greenM}
                            onMouseLeave={e=>e.currentTarget.style.background=T.greenL}>
                            <span style={{fontSize:16}}>➕</span>
                            <div>
                              <div style={{fontSize:13,fontWeight:800,color:T.green}}>Add "{form.areaName.trim()}" as a new area</div>
                              <div style={{fontSize:11,color:"#4d7a5f"}}>This area will be saved and appear in search suggestions for everyone</div>
                            </div>
                          </div>
                        )}
                        {matches.length===0 && form.areaName.trim().length<3 && (
                          <div style={{padding:"12px 14px",fontSize:12,color:T.muted}}>Keep typing to search or add a new area…</div>
                        )}
                      </div>
                    );
                  })()}
                </div>
                {/* Confirmation badge */}
                {form.areaName && customAreas.some(a=>a.label.toLowerCase()===form.areaName.toLowerCase()) && (
                  <div style={{marginTop:6,background:T.greenL,border:`1px solid ${T.greenM}`,borderRadius:8,padding:"6px 10px",fontSize:11,color:T.green,fontWeight:700,display:"flex",alignItems:"center",gap:6}}>
                    🆕 New area — will be added to search suggestions automatically
                  </div>
                )}
              </div>

              <div><div style={{fontSize:11,fontWeight:800,color:T.muted,marginBottom:4}}>FULL ADDRESS *</div>{inp("House no, Road no, Area, City","address")}</div>
              <div>
                <div style={{fontSize:11,fontWeight:800,color:T.muted,marginBottom:4}}>DIVISION</div>
                <select value={form.division} onChange={e=>upd("division",e.target.value)} style={{width:"100%",padding:"10px 12px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,color:"#444",background:"#fff",outline:"none"}}>
                  {DIVISIONS_EN.slice(1).map(d=><option key={d}>{d}</option>)}
                </select>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:9}}>
                {[["🛏 BEDS","beds"],["🚿 BATHS","baths"],["📐 SQFT","area"],["🏢 FLOOR","floor"]].map(([label,key])=>(
                  <div key={key}><div style={{fontSize:10,fontWeight:800,color:T.muted,marginBottom:4}}>{label}</div><input type="number" value={form[key]} onChange={e=>upd(key,e.target.value)} placeholder="0" style={{width:"100%",padding:"10px 8px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,outline:"none",boxSizing:"border-box"}}/></div>
                ))}
              </div>
              <div><div style={{fontSize:11,fontWeight:800,color:T.muted,marginBottom:4}}>{form.status==="for-rent"?"MONTHLY RENT (৳) *":"ASKING PRICE (৳) *"}</div>{inp("e.g. 25000","price","number")}</div>
            </div>
          )}
          {step===2&&(
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div>
                <div style={{fontSize:11,fontWeight:800,color:T.muted,letterSpacing:.6,marginBottom:8}}>FURNISHING STATUS</div>
                <div style={{display:"flex",gap:8}}>
                  {[["Unfurnished","unfurnished"],["Semi-Furnished","semi"],["Fully Furnished","full"]].map(([label,val])=>{
                    const active=form.furnished===val;
                    return <button key={val} onClick={()=>upd("furnished",val)} style={{flex:1,padding:"9px 4px",border:"2px solid",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:11,borderColor:active?T.green:T.border,background:active?T.greenL:"#fff",color:active?T.green:T.text}}>{label}</button>;
                  })}
                </div>
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:800,color:T.muted,letterSpacing:.6,marginBottom:8}}>AVAILABILITY</div>
                <div style={{display:"flex",gap:8,marginBottom:8}}>
                  {[["⚡ Available Now","now"],["📅 Specific Date","date"]].map(([label,val])=>{
                    const active=form.avail===val;
                    return <button key={val} onClick={()=>upd("avail",val)} style={{flex:1,padding:"9px",border:"2px solid",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:12,borderColor:active?T.red:T.border,background:active?T.redL:"#fff",color:active?T.red:T.text}}>{label}</button>;
                  })}
                </div>
                {form.avail==="date"&&<input type="date" value={form.availDate} onChange={e=>upd("availDate",e.target.value)} style={{width:"100%",padding:"10px 12px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,outline:"none",boxSizing:"border-box"}}/>}
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
                      {form.inspSlots.length>1&&<button onClick={()=>removeSlot(i)} style={{background:T.redL,color:T.red,border:"none",borderRadius:"50%",width:26,height:26,cursor:"pointer",fontWeight:800,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>}
                    </div>
                  ))}
                </div>
                {form.inspSlots.some(s=>s.day)&&<div style={{marginTop:9,fontSize:11,color:T.green,fontWeight:600}}>✅ {form.inspSlots.filter(s=>s.day).length} slot(s) added</div>}
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:800,color:T.muted,letterSpacing:.6,marginBottom:8}}>UTILITIES INCLUDED IN RENT</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {["Gas","Water","Electricity","WiFi","Generator","AC","Lift","Security","Parking"].map(u=>{
                    const active=form.utils.includes(u);
                    return <button key={u} onClick={()=>toggleArr("utils",u)} style={{padding:"5px 12px",border:"1.5px solid",borderRadius:18,cursor:"pointer",fontSize:12,fontWeight:700,borderColor:active?T.green:T.border,background:active?T.greenL:"#fff",color:active?T.green:"#555"}}>{u}</button>;
                  })}
                </div>
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:800,color:T.muted,letterSpacing:.6,marginBottom:8}}>TENANT PREFERENCES</div>
                <div style={{display:"flex",gap:9}}>
                  {[["🐾 Pets Allowed","petFriendly"],["👥 Flatmates OK","flatmate"]].map(([label,key])=>{
                    const active=form[key];
                    return <button key={key} onClick={()=>upd(key,!form[key])} style={{flex:1,padding:"10px",border:"2px solid",borderRadius:11,cursor:"pointer",fontWeight:700,fontSize:12,borderColor:active?T.green:T.border,background:active?T.greenL:"#fff",color:active?T.green:T.text}}>{label}</button>;
                  })}
                </div>
              </div>
            </div>
          )}
          {step===3&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <div style={{fontSize:11,fontWeight:800,color:T.muted,letterSpacing:.6,marginBottom:8}}>PROPERTY HIGHLIGHTS</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {["Corner Unit","Top Floor","Lake View","Sea View","Garden","Pool","Gym","Rooftop","Elevator","24hr Security","CCTV","Prayer Room","School Nearby","Hospital Nearby"].map(f=>{
                    const active=form.features.includes(f);
                    return <button key={f} onClick={()=>toggleArr("features",f)} style={{padding:"5px 11px",border:"1.5px solid",borderRadius:18,cursor:"pointer",fontSize:12,fontWeight:700,borderColor:active?T.red:T.border,background:active?T.redL:"#fff",color:active?T.red:"#555"}}>{f}</button>;
                  })}
                </div>
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:800,color:T.muted,letterSpacing:.6,marginBottom:4}}>DESCRIPTION (optional)</div>
                <textarea rows={4} value={form.desc} onChange={e=>upd("desc",e.target.value)} placeholder="Describe your property — nearby landmarks, special features, house rules…"
                  style={{width:"100%",padding:"10px 12px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"inherit"}}/>
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:800,color:T.muted,letterSpacing:.6,marginBottom:8}}>📷 PROPERTY PHOTOS (up to 10)</div>
                <div style={{fontSize:11,color:T.muted,marginBottom:10}}>First photo = cover photo shown in listings. Tap ⭐ to change cover.</div>
                <label style={{display:"block",border:`2px dashed ${form.photos.length>0?T.green:T.border}`,borderRadius:12,padding:"20px",textAlign:"center",cursor:"pointer",background:form.photos.length>0?T.greenL:"#fafafa",transition:"all .2s"}}>
                  <input type="file" accept="image/*" multiple style={{display:"none"}}
                    onChange={e=>{
                      const files=Array.from(e.target.files);
                      const remaining=10-form.photos.length;
                      const toAdd=files.slice(0,remaining);
                      toAdd.forEach(f=>{
                        const reader=new FileReader();
                        reader.onload=ev=>{
                          setForm(prev=>({...prev,photos:[...prev.photos,{url:ev.target.result,name:f.name,size:(f.size/1024/1024).toFixed(1)}]}));
                        };
                        reader.readAsDataURL(f);
                      });
                    }}
                  />
                  <div style={{fontSize:28,marginBottom:6}}>📷</div>
                  <div style={{fontWeight:700,fontSize:13,color:form.photos.length>0?T.green:T.muted}}>
                    {form.photos.length>0?`${form.photos.length} photo${form.photos.length>1?"s":""} selected — tap to add more`:"Click here to select photos"}
                  </div>
                  <div style={{fontSize:11,color:T.muted,marginTop:4}}>JPG, PNG, WEBP · Max 5MB each · Up to 10 photos</div>
                </label>
                {form.photos.length>0&&(
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:12}}>
                    {form.photos.map((ph,i)=>(
                      <div key={i} style={{position:"relative",borderRadius:10,overflow:"hidden",border:`2.5px solid ${i===form.coverIdx?T.gold:"transparent"}`,boxShadow:i===form.coverIdx?"0 0 0 1px "+T.gold:"0 1px 4px rgba(0,0,0,0.1)"}}>
                        <img src={ph.url} alt={ph.name} style={{width:"100%",height:80,objectFit:"cover",display:"block"}}/>
                        {i===form.coverIdx&&(
                          <div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(245,200,66,0.92)",textAlign:"center",fontSize:9,fontWeight:800,padding:"2px",color:"#1a2e22"}}>⭐ COVER</div>
                        )}
                        <div style={{position:"absolute",top:4,right:4,display:"flex",gap:3}}>
                          {i!==form.coverIdx&&(
                            <button onClick={()=>upd("coverIdx",i)} title="Set as cover" style={{background:"rgba(245,200,66,0.9)",border:"none",borderRadius:6,width:22,height:22,cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"}}>⭐</button>
                          )}
                          <button onClick={()=>{
                            const newPhotos=form.photos.filter((_,idx)=>idx!==i);
                            upd("photos",newPhotos);
                            if(form.coverIdx>=newPhotos.length) upd("coverIdx",0);
                          }} style={{background:"rgba(200,16,46,0.85)",border:"none",borderRadius:6,width:22,height:22,cursor:"pointer",color:"#fff",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                        </div>
                        <div style={{position:"absolute",top:4,left:4,background:"rgba(0,0,0,0.5)",color:"#fff",fontSize:8,padding:"1px 5px",borderRadius:5}}>{ph.size}MB</div>
                      </div>
                    ))}
                    {form.photos.length<10&&(
                      <label style={{border:`2px dashed ${T.border}`,borderRadius:10,height:84,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",background:"#fafafa",gap:4}}>
                        <input type="file" accept="image/*" multiple style={{display:"none"}}
                          onChange={e=>{
                            const files=Array.from(e.target.files);
                            const remaining=10-form.photos.length;
                            files.slice(0,remaining).forEach(f=>{
                              const reader=new FileReader();
                              reader.onload=ev=>{
                                setForm(prev=>({...prev,photos:[...prev.photos,{url:ev.target.result,name:f.name,size:(f.size/1024/1024).toFixed(1)}]}));
                              };
                              reader.readAsDataURL(f);
                            });
                          }}
                        />
                        <span style={{fontSize:20}}>➕</span>
                        <span style={{fontSize:9,color:T.muted,fontWeight:600}}>{10-form.photos.length} left</span>
                      </label>
                    )}
                  </div>
                )}
                {form.photos.length===0&&(
                  <div style={{marginTop:10,display:"flex",gap:6,flexWrap:"wrap"}}>
                    {["📸 Good lighting = more enquiries","🏠 Show living room first","🌿 Include exterior view","🚿 Bathroom & kitchen matter"].map(tip=>(
                      <span key={tip} style={{background:T.greenL,color:T.green,fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:8,border:`1px solid ${T.greenM}`}}>{tip}</span>
                    ))}
                  </div>
                )}
                {form.photos.length>0&&(
                  <div style={{marginTop:10,background:T.greenL,border:`1px solid ${T.greenM}`,borderRadius:9,padding:"9px 12px",fontSize:11,color:T.green,fontWeight:600}}>
                    ✅ {form.photos.length} photo{form.photos.length>1?"s":""} ready · Cover: photo #{form.coverIdx+1} · These will be uploaded when you publish
                  </div>
                )}
              </div>
              {form.price&&<div style={{background:T.greenL,border:`1px solid ${T.greenM}`,borderRadius:11,padding:"11px 13px",fontSize:12,color:T.green,fontWeight:600}}>👁 Preview: <strong>{form.title||"Your Property"}</strong> · ৳{Number(form.price||0).toLocaleString("en-BD")}{form.status==="for-rent"?"/mo":""} · {form.division}{form.inspSlots.filter(s=>s.day).length>0&&` · ${form.inspSlots.filter(s=>s.day).length} inspection slot(s)`}</div>}
            </div>
          )}
          {step===4&&(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{background:T.redL,border:`1px solid ${T.redM}`,borderRadius:11,padding:"11px 13px",fontSize:13,color:T.red,fontWeight:600}}>🎉 Almost done! Add your contact so tenants can reach you.</div>
              <div><div style={{fontSize:11,fontWeight:800,color:T.muted,marginBottom:4}}>YOUR FULL NAME *</div>{inp("e.g. Mohammad Hasan","name")}</div>
              <div><div style={{fontSize:11,fontWeight:800,color:T.muted,marginBottom:4}}>YOUR PHONE NUMBER *</div>{inp("01X-XXXXXXXX","phone")}</div>
              <div style={{background:T.greenL,border:`1px solid ${T.greenM}`,borderRadius:11,padding:"13px 15px"}}>
                <div style={{fontWeight:800,fontSize:13,color:T.green,marginBottom:7}}>Your listing summary:</div>
                <div style={{fontSize:12,color:"#374151",lineHeight:2}}>
                  📌 {form.title||"—"}<br/>📍 {form.address||"—"}, {form.division}<br/>
                  💰 ৳{Number(form.price||0).toLocaleString("en-BD")}{form.status==="for-rent"?"/mo":""}<br/>
                  🛏 {form.beds||"?"} Beds · 🚿 {form.baths||"?"} Baths · 📐 {form.area||"?"} sqft<br/>
                  {form.utils.length>0&&<span>⚡ Includes: {form.utils.join(", ")}<br/></span>}
                  {form.inspSlots.filter(s=>s.day).length>0&&<span>📅 {form.inspSlots.filter(s=>s.day).map(s=>`${s.day}${s.time?" – "+s.time:""}`).join(" | ")}<br/></span>}
                  {form.photos.length>0&&<span>📷 {form.photos.length} photo{form.photos.length>1?"s":""} ready to upload<br/></span>}
                  {form.petFriendly&&<span>🐾 Pets welcome · </span>}{form.flatmate&&<span>👥 Flatmate friendly</span>}
                </div>
              </div>
              <button onClick={()=>{ if(editingProp){ if(onEditProperty) onEditProperty(editingProp.id, form); } else { if(onAddProperty) onAddProperty(form); } onClose(); }} style={{background:T.red,color:"#fff",border:"none",padding:"14px",borderRadius:12,fontWeight:900,fontSize:15,cursor:"pointer",marginTop:4}}>{editingProp ? "💾 Update My Listing" : "🚀 Publish My Listing — Free!"}</button>
            </div>
          )}
          {step<4&&(
            <div style={{display:"flex",gap:9,marginTop:20}}>
              {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:"11px",border:`2px solid ${T.border}`,borderRadius:11,background:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",color:T.muted}}>← Back</button>}
              <button onClick={()=>setStep(s=>s+1)} style={{flex:2,background:T.green,color:"#fff",border:"none",padding:"11px",borderRadius:11,fontWeight:800,fontSize:14,cursor:"pointer"}}>Continue → {STEPS[step+1]}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── PWA INSTALL BANNER ───────────────────────── */
function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner]         = useState(false);
  const [isIOS, setIsIOS]                   = useState(false);
  const [isInstalled, setIsInstalled]       = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }
    // iOS detection
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    // Track visits — show banner after 2nd visit
    const visits = parseInt(localStorage.getItem("basha_visits") || "0") + 1;
    localStorage.setItem("basha_visits", visits);
    const dismissed = localStorage.getItem("basha_pwa_dismissed");

    // Android/Chrome — capture the install prompt
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (visits >= 2 && !dismissed) setShowBanner(true);
    });

    // iOS — show manual instructions after 2nd visit
    if (ios && visits >= 2 && !dismissed) {
      setTimeout(() => setShowBanner(true), 2000);
    }

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowBanner(false);
      localStorage.setItem("basha_pwa_dismissed", "installed");
    });
  }, []);

  const install = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const dismiss = () => {
    setShowBanner(false);
    localStorage.setItem("basha_pwa_dismissed", "yes");
  };

  return { showBanner, isIOS, isInstalled, install, dismiss };
}

function PWABanner({ onInstall, onDismiss, isIOS }) {
  const [step, setStep] = useState(0);
  return (
    <div style={{
      position:"fixed", bottom: 80, left:12, right:12, zIndex:2000,
      background:"#fff", borderRadius:18,
      boxShadow:"0 8px 40px rgba(0,0,0,0.18)",
      border:`2px solid ${T.green}`,
      overflow:"hidden",
      animation:"slideUp .3s ease",
    }}>
      <style>{`@keyframes slideUp{from{transform:translateY(100px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

      {/* Header */}
      <div style={{background:`linear-gradient(135deg,${T.green},#0a3d22)`,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:44,height:44,background:"rgba(255,255,255,0.15)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>🏠</div>
        <div style={{flex:1}}>
          <div style={{color:"#fff",fontWeight:900,fontSize:15,fontFamily:"'Playfair Display',serif"}}>
            Basha<span style={{color:T.gold}}>.app</span>
          </div>
          <div style={{color:"rgba(255,255,255,0.8)",fontSize:11,marginTop:1}}>
            Install for free — works like a real app!
          </div>
        </div>
        <button onClick={onDismiss} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:28,height:28,color:"#fff",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>
      </div>

      {/* Body */}
      <div style={{padding:"14px 16px"}}>
        {!isIOS ? (
          /* Android / Chrome */
          <div>
            <div style={{fontSize:13,color:T.muted,marginBottom:12,lineHeight:1.6}}>
              Add <strong style={{color:T.text}}>Basha.app</strong> to your home screen — instant access, works offline, feels like a native app. <strong style={{color:T.green}}>100% free.</strong>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={onInstall} style={{flex:1,background:T.green,color:"#fff",border:"none",padding:"12px",borderRadius:11,fontWeight:800,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                📲 Install Now — Free
              </button>
              <button onClick={onDismiss} style={{background:T.bg,color:T.muted,border:`1px solid ${T.border}`,padding:"12px 14px",borderRadius:11,fontWeight:600,fontSize:13,cursor:"pointer"}}>
                Later
              </button>
            </div>
          </div>
        ) : (
          /* iOS Safari — step by step */
          <div>
            {step===0 ? (
              <div>
                <div style={{fontSize:13,color:T.muted,marginBottom:12,lineHeight:1.6}}>
                  Install <strong style={{color:T.text}}>Basha.app</strong> on your iPhone home screen in 2 taps — no App Store needed!
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                  {[
                    {icon:"⬆️",label:"Tap Share"},
                    {icon:"➕",label:"Add to Home"},
                    {icon:"🏠",label:"Done!"},
                  ].map(({icon,label})=>(
                    <div key={label} style={{background:T.greenL,border:`1px solid ${T.greenM}`,borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                      <div style={{fontSize:22}}>{icon}</div>
                      <div style={{fontSize:11,fontWeight:700,color:T.green,marginTop:4}}>{label}</div>
                    </div>
                  ))}
                </div>
                <button onClick={()=>setStep(1)} style={{width:"100%",background:T.green,color:"#fff",border:"none",padding:"11px",borderRadius:11,fontWeight:800,fontSize:14,cursor:"pointer"}}>
                  Show me how →
                </button>
              </div>
            ) : (
              <div>
                <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:10}}>Follow these steps:</div>
                {[
                  {n:"1",icon:"⬆️",text:'Tap the Share button at the bottom of Safari (the box with an arrow)'},
                  {n:"2",icon:"➕",text:'Scroll down and tap "Add to Home Screen"'},
                  {n:"3",icon:"✏️",text:'Name it "Basha.app" and tap Add'},
                  {n:"4",icon:"🎉",text:'Done! Find Basha.app on your home screen'},
                ].map(s=>(
                  <div key={s.n} style={{display:"flex",gap:10,marginBottom:10,alignItems:"flex-start"}}>
                    <div style={{width:28,height:28,background:T.green,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:13,flexShrink:0}}>{s.n}</div>
                    <div style={{flex:1}}>
                      <span style={{fontSize:18,marginRight:6}}>{s.icon}</span>
                      <span style={{fontSize:12,color:T.text,lineHeight:1.5}}>{s.text}</span>
                    </div>
                  </div>
                ))}
                <button onClick={onDismiss} style={{width:"100%",background:T.greenL,color:T.green,border:`1px solid ${T.greenM}`,padding:"10px",borderRadius:11,fontWeight:700,fontSize:13,cursor:"pointer",marginTop:4}}>
                  Got it ✓
                </button>
              </div>
            )}
          </div>
        )}

        {/* Benefits row */}
        <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
          {["⚡ Instant load","📴 Works offline","🔔 Notifications","📱 Home screen"].map(b=>(
            <span key={b} style={{fontSize:10,fontWeight:700,color:T.green,background:T.greenL,padding:"3px 8px",borderRadius:20,border:`1px solid ${T.greenM}`}}>{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── SEARCH DROPDOWN COMPONENT ────────────────── */
function SearchDropdown({search, customAreas, onSelect}){
  const allSugg = [
    ...AREA_SUGGESTIONS,
    ...customAreas.map(a=>({label:a.label, sub:a.sub, isCustom:true}))
  ];
  const matches = allSugg.filter(a=>
    a.label.toLowerCase().includes(search.toLowerCase()) ||
    (a.sub||"").toLowerCase().includes(search.toLowerCase())
  ).slice(0,8);
  if(matches.length===0) return null;
  return (
    <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:"#fff",border:`1.5px solid ${T.border}`,borderRadius:10,boxShadow:"0 8px 30px rgba(0,0,0,0.12)",zIndex:999,overflow:"hidden"}}>
      {matches.map((a,i)=>(
        <div key={i}
          onMouseDown={()=>onSelect(a.label)}
          style={{padding:"10px 14px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:i<matches.length-1?`1px solid ${T.border}`:"none",background:"#fff"}}
          onMouseEnter={e=>e.currentTarget.style.background=T.redL}
          onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{color:a.isCustom?T.green:T.red,fontSize:13}}>{a.isCustom?"🆕":"📍"}</span>
            <span style={{fontSize:13,fontWeight:700,color:T.text}}>
              {a.label.toLowerCase().startsWith(search.toLowerCase())
                ? <><strong style={{color:T.red}}>{a.label.slice(0,search.length)}</strong>{a.label.slice(search.length)}</>
                : a.label}
            </span>
          </div>
          <span style={{fontSize:11,color:T.muted,display:"flex",alignItems:"center",gap:4}}>
            {a.sub}
            {a.isCustom&&<span style={{background:T.greenL,color:T.green,fontSize:9,fontWeight:800,padding:"1px 5px",borderRadius:8}}>NEW</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── ANALYTICS ENGINE ─────────────────────────── */
const Analytics = {
  _key: "basha_analytics",
  _load() {
    try { return JSON.parse(localStorage.getItem(this._key)||"{}"); } catch(e){ return {}; }
  },
  _save(data) {
    try { localStorage.setItem(this._key, JSON.stringify(data)); } catch(e){}
  },
  track(event, data={}) {
    const store = this._load();
    const day = new Date().toISOString().slice(0,10);
    // Daily events log
    if(!store.events) store.events = [];
    store.events.push({ event, data, ts: Date.now(), day });
    // Keep last 500 events
    if(store.events.length > 500) store.events = store.events.slice(-500);
    // Aggregates
    if(!store.agg) store.agg = {};
    const k = `${event}:${JSON.stringify(data)}`;
    store.agg[k] = (store.agg[k]||0) + 1;
    // Daily counts
    if(!store.daily) store.daily = {};
    if(!store.daily[day]) store.daily[day] = {};
    store.daily[day][event] = (store.daily[day][event]||0) + 1;
    // Property-specific
    if(data.propId) {
      if(!store.props) store.props = {};
      if(!store.props[data.propId]) store.props[data.propId] = {views:0,saves:0,enquiries:0,inspections:0};
      if(event==="view") store.props[data.propId].views++;
      if(event==="save") store.props[data.propId].saves++;
      if(event==="enquiry") store.props[data.propId].enquiries++;
      if(event==="inspection") store.props[data.propId].inspections++;
    }
    // Search terms
    if(event==="search" && data.query) {
      if(!store.searches) store.searches = {};
      const q = data.query.toLowerCase().trim();
      if(q) store.searches[q] = (store.searches[q]||0) + 1;
    }
    this._save(store);
  },
  getStats() {
    const store = this._load();
    const today = new Date().toISOString().slice(0,10);
    const days = [];
    for(let i=6; i>=0; i--) {
      const d = new Date(); d.setDate(d.getDate()-i);
      const key = d.toISOString().slice(0,10);
      days.push({
        label: i===0?"Today":i===1?"Yesterday":d.toLocaleDateString("en-BD",{weekday:"short"}),
        key,
        views: store.daily?.[key]?.view || 0,
        saves: store.daily?.[key]?.save || 0,
        searches: store.daily?.[key]?.search || 0,
        enquiries: store.daily?.[key]?.enquiry || 0,
      });
    }
    const topSearches = Object.entries(store.searches||{})
      .sort((a,b)=>b[1]-a[1]).slice(0,8)
      .map(([q,c])=>({query:q,count:c}));
    const propStats = store.props || {};
    const totalViews = Object.values(propStats).reduce((a,p)=>a+p.views,0);
    const totalSaves = Object.values(propStats).reduce((a,p)=>a+p.saves,0);
    const totalEnquiries = Object.values(propStats).reduce((a,p)=>a+p.enquiries,0);
    const todayViews = store.daily?.[today]?.view || 0;
    const todaySearches = store.daily?.[today]?.search || 0;
    return { days, topSearches, propStats, totalViews, totalSaves, totalEnquiries, todayViews, todaySearches };
  },
  getPropStats(propId) {
    const store = this._load();
    return store.props?.[propId] || {views:0,saves:0,enquiries:0,inspections:0};
  },
};

/* ── ADMIN PANEL (admin-only, site-wide view) ── */
function AdminPanel({lang="en"}){
  const isBn = lang==="bn";
  const t = (en,bn)=>isBn?bn:en;
  const bn = v => isBn?toBn(v):v;
  const stats = Analytics.getStats();
  const pname = p => isBn&&p.titleBn ? p.titleBn : p.title;

  // Site-wide totals across ALL listings (owners + everyone)
  const allProps = PROPERTIES.map(p=>{
    const live = Analytics.getPropStats(p.id);
    return {...p, totalViews:p.views+live.views, totalSaves:p.saves+live.saves, enquiries:live.enquiries};
  }).sort((a,b)=>b.totalViews-a.totalViews);

  const siteViews = allProps.reduce((a,p)=>a+p.totalViews,0);
  const siteSaves = allProps.reduce((a,p)=>a+p.totalSaves,0);
  const siteEnq = allProps.reduce((a,p)=>a+p.enquiries,0);
  const totalListings = PROPERTIES.length;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Admin badge */}
      <div style={{background:"#1f2937",color:"#fff",borderRadius:12,padding:"12px 15px",display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:22}}>🛡</span>
        <div>
          <div style={{fontWeight:800,fontSize:14}}>{t("Admin Overview","অ্যাডমিন ওভারভিউ")}</div>
          <div style={{fontSize:11,opacity:.8}}>{t("Site-wide stats across all listings","সব তালিকার সাইট-ব্যাপী পরিসংখ্যান")}</div>
        </div>
      </div>

      {/* Site KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[
          {icon:"🏠",val:bn(totalListings),label:t("Total Listings","মোট তালিকা"),c:T.green,bg:T.greenL},
          {icon:"👁",val:bn(siteViews),label:t("Total Views","মোট ভিউ"),c:T.red,bg:T.redL},
          {icon:"❤️",val:bn(siteSaves),label:t("Total Saves","মোট সেভ"),c:"#e11d48",bg:"#fff1f2"},
          {icon:"✉️",val:bn(siteEnq),label:t("Total Enquiries","মোট জিজ্ঞাসা"),c:"#7c3aed",bg:"#f5f3ff"},
        ].map(({icon,val,label,c,bg})=>(
          <div key={label} style={{background:bg,borderRadius:12,padding:"14px",textAlign:"center"}}>
            <div style={{fontSize:22}}>{icon}</div>
            <div style={{fontSize:22,fontWeight:900,color:c}}>{val}</div>
            <div style={{fontSize:11,color:T.muted,fontWeight:600}}>{label}</div>
          </div>
        ))}
      </div>

      {/* 7-day activity */}
      <div style={{background:"#fff",border:`1px solid ${T.border}`,borderRadius:13,padding:"14px 16px"}}>
        <div style={{fontWeight:800,fontSize:13,color:T.text,marginBottom:12}}>📈 {t("Activity — Last 7 Days","কার্যকলাপ — গত ৭ দিন")}</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:6,height:90}}>
          {stats.days.map(d=>{
            const max = Math.max(...stats.days.map(x=>x.views),1);
            return (
              <div key={d.key} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{fontSize:10,fontWeight:700,color:T.muted}}>{bn(d.views)}</div>
                <div style={{width:"100%",height:`${(d.views/max)*60}px`,minHeight:3,background:T.green,borderRadius:"4px 4px 0 0"}}/>
                <div style={{fontSize:9,color:T.muted}}>{d.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top searches site-wide */}
      {stats.topSearches.length>0 && (
        <div style={{background:"#fff",border:`1px solid ${T.border}`,borderRadius:13,padding:"14px 16px"}}>
          <div style={{fontWeight:800,fontSize:13,color:T.text,marginBottom:10}}>🔥 {t("Top Searches","শীর্ষ সার্চ")}</div>
          {stats.topSearches.map((s,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<stats.topSearches.length-1?`1px solid ${T.border}`:"none"}}>
              <span style={{fontSize:12,color:T.text}}>{s.query}</span>
              <span style={{fontSize:11,color:T.muted,fontWeight:600}}>{bn(s.count)}×</span>
            </div>
          ))}
        </div>
      )}

      {/* All listings ranked by views */}
      <div style={{fontWeight:800,fontSize:13,color:T.text}}>🏆 {t("All Listings by Views","ভিউ অনুযায়ী সব তালিকা")}</div>
      {allProps.map((p,i)=>(
        <div key={p.id} style={{background:"#fff",border:`1px solid ${T.border}`,borderRadius:11,padding:"10px 13px",display:"flex",alignItems:"center",gap:12}}>
          <div style={{fontSize:13,fontWeight:900,color:T.muted,minWidth:20}}>{bn(i+1)}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:12.5,fontWeight:700,color:T.text,lineHeight:1.3}}>{pname(p)}</div>
            <div style={{fontSize:11,color:T.muted}}>📍 {p.location}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:13,fontWeight:800,color:T.red}}>👁 {bn(p.totalViews)}</div>
            <div style={{fontSize:10,color:T.muted}}>❤️ {bn(p.totalSaves)} · ✉️ {bn(p.enquiries)}</div>
          </div>
        </div>
      ))}

      {/* Honest disclaimer */}
      <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:11,padding:"12px 14px",fontSize:11.5,color:"#92400e",lineHeight:1.6}}>
        ⚠️ {t("These counts come from this browser's local data only — they are not live site-wide visitor numbers. For real traffic across all visitors, use Vercel Analytics in your Vercel dashboard.","এই সংখ্যাগুলো শুধু এই ব্রাউজারের স্থানীয় ডেটা থেকে — এগুলো সাইট-ব্যাপী রিয়েল ভিজিটর সংখ্যা নয়। সব ভিজিটরের প্রকৃত ট্রাফিকের জন্য Vercel ড্যাশবোর্ডে Vercel Analytics ব্যবহার করুন।")}
      </div>
    </div>
  );
}


function LeafletMap({ properties, onSelect, savedIds, onSaveToggle }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Inject Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    // Load Leaflet JS
    const loadLeaflet = () => {
      if (window.L) { initMap(); return; }
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = initMap;
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current || mapInstanceRef.current) return;
      const L = window.L;

      const map = L.map(mapRef.current, {
        center: [23.8103, 90.4125], // Dhaka
        zoom: 11,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      addMarkers(map, properties);
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when filters change
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const map = mapInstanceRef.current;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    addMarkers(map, properties);
  }, [properties]);

  const addMarkers = (map, props) => {
    if (!window.L) return;
    const L = window.L;

    // Precise coordinates for well-known Dhaka/Chittagong areas (keep existing accuracy)
    const coordMap = {
      "Bashundhara R/A, Dhaka":   [23.8122, 90.4240],
      "Gulshan 1, Dhaka":         [23.7808, 90.4147],
      "Uttara Sector 6, Dhaka":   [23.8749, 90.3984],
      "Banani, Dhaka":            [23.7936, 90.4066],
      "Dhanmondi, Dhaka":         [23.7461, 90.3742],
      "Panchlaish, Chittagong":   [22.3669, 91.8128],
      "Mirpur 10, Dhaka":         [23.8074, 90.3679],
      "Baridhara, Dhaka":         [23.7965, 90.4244],
      "Gulshan 2, Dhaka":         [23.7925, 90.4143],
      "Purbachal New Town, Dhaka":[23.8204, 90.5031],
    };

    // 8 divisions
    const DIV_COORDS = {
      "dhaka":[23.8103,90.4125], "chittagong":[22.3569,91.7832], "chattogram":[22.3569,91.7832],
      "sylhet":[24.8949,91.8687], "rajshahi":[24.3636,88.6241], "khulna":[22.8456,89.5403],
      "barishal":[22.7010,90.3535], "barisal":[22.7010,90.3535], "rangpur":[25.7439,89.2752],
      "mymensingh":[24.7471,90.4203],
    };

    // 64 districts — centre coordinates
    const DIST_COORDS = {
      "dhaka":[23.8103,90.4125],"gazipur":[24.0023,90.4264],"narayanganj":[23.6238,90.5000],
      "tangail":[24.2513,89.9167],"narsingdi":[23.9226,90.7150],"munshiganj":[23.5422,90.5305],
      "manikganj":[23.8617,90.0003],"kishoreganj":[24.4449,90.7766],"gopalganj":[23.0050,89.8266],
      "madaripur":[23.1641,90.1897],"shariatpur":[23.2423,90.4348],"rajbari":[23.7574,89.6445],
      "faridpur":[23.6070,89.8429],"chittagong":[22.3569,91.7832],"chattogram":[22.3569,91.7832],
      "coxsbazar":[21.4272,92.0058],"cox's bazar":[21.4272,92.0058],"coxs bazar":[21.4272,92.0058],
      "bandarban":[22.1953,92.2184],"rangamati":[22.6533,92.1751],"khagrachhari":[23.1193,91.9847],
      "feni":[23.0159,91.3976],"noakhali":[22.8696,91.0995],"lakshmipur":[22.9447,90.8282],
      "comilla":[23.4607,91.1809],"cumilla":[23.4607,91.1809],"chandpur":[23.2333,90.6712],
      "brahmanbaria":[23.9571,91.1119],"sylhet":[24.8949,91.8687],"moulvibazar":[24.4829,91.7774],
      "habiganj":[24.3745,91.4155],"sunamganj":[25.0658,91.3950],"rajshahi":[24.3636,88.6241],
      "natore":[24.4206,89.0000],"naogaon":[24.7936,88.9318],"chapainawabganj":[24.5965,88.2776],
      "nawabganj":[24.5965,88.2776],"pabna":[24.0064,89.2372],"sirajganj":[24.4534,89.7007],
      "bogura":[24.8466,89.3773],"bogra":[24.8466,89.3773],"joypurhat":[25.0968,89.0227],
      "khulna":[22.8456,89.5403],"bagerhat":[22.6516,89.7859],"satkhira":[22.7185,89.0705],
      "jessore":[23.1664,89.2081],"jashore":[23.1664,89.2081],"jhenaidah":[23.5448,89.1539],
      "magura":[23.4855,89.4198],"narail":[23.1729,89.5128],"kushtia":[23.9013,89.1206],
      "chuadanga":[23.6402,88.8418],"meherpur":[23.7622,88.6318],"barishal":[22.7010,90.3535],
      "barisal":[22.7010,90.3535],"bhola":[22.6859,90.6483],"patuakhali":[22.3596,90.3299],
      "pirojpur":[22.5841,89.9720],"jhalokati":[22.6406,90.1987],"barguna":[22.0953,90.1121],
      "rangpur":[25.7439,89.2752],"dinajpur":[25.6217,88.6354],"thakurgaon":[26.0337,88.4616],
      "panchagarh":[26.3411,88.5542],"nilphamari":[25.9310,88.8560],"lalmonirhat":[25.9923,89.2847],
      "kurigram":[25.8054,89.6362],"gaibandha":[25.3288,89.5286],"mymensingh":[24.7471,90.4203],
      "jamalpur":[24.9375,89.9371],"sherpur":[25.0205,90.0153],"netrokona":[24.8709,90.7279],
    };

    const norm = (x)=> (x||"").toLowerCase().replace(/[^a-z\s']/g,"").trim();

    const findCoords = (p)=>{
      // step 1 - exact precise match
      if(coordMap[p.location]) return coordMap[p.location];
      const locN = norm(p.location);
      const divN = norm(p.division);
      // step 2 - district name appears in location or division text
      for(const d in DIST_COORDS){
        if(locN.includes(d) || divN.includes(d)) return DIST_COORDS[d];
      }
      // step 3 - division match
      if(DIV_COORDS[divN]) return DIV_COORDS[divN];
      for(const dv in DIV_COORDS){
        if(locN.includes(dv) || divN.includes(dv)) return DIV_COORDS[dv];
      }
      // step 4 - nothing
      return null;
    };

    props.forEach(p => {
      const coords = findCoords(p);
      if (!coords) return;

      const price = p.status === "for-rent"
        ? `৳${p.price.toLocaleString("en-BD")}/mo`
        : p.price >= 10000000
          ? `৳${(p.price/10000000).toFixed(1)}Cr`
          : `৳${(p.price/100000).toFixed(0)}L`;

      const color = p.status === "for-sale" ? "#C8102E" : "#1a6b3c";

      // Custom pin HTML
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          background:${color};
          color:#fff;
          padding:4px 8px;
          border-radius:20px;
          font-size:11px;
          font-weight:800;
          white-space:nowrap;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
          border:2px solid #fff;
          font-family:'DM Sans',sans-serif;
          cursor:pointer;
          position:relative;
        ">${price}<div style="
          position:absolute;
          bottom:-6px;
          left:50%;
          transform:translateX(-50%);
          width:0;height:0;
          border-left:5px solid transparent;
          border-right:5px solid transparent;
          border-top:6px solid ${color};
        "></div></div>`,
        iconSize: [null, null],
        iconAnchor: [0, 0],
      });

      const marker = L.marker(coords, { icon }).addTo(map);

      // Popup on click
      marker.on("click", () => {
        const popup = L.popup({ maxWidth: 240, closeButton: true })
          .setLatLng(coords)
          .setContent(`
            <div style="font-family:'DM Sans',sans-serif;padding:4px">
              <img src="${p.img||PHOTO_PLACEHOLDER}" style="width:100%;height:110px;object-fit:cover;border-radius:8px;margin-bottom:8px"/>
              <div style="font-weight:800;font-size:13px;color:#111;margin-bottom:2px;line-height:1.3">${p.title}</div>
              <div style="font-size:16px;font-weight:900;color:${color};margin-bottom:4px">${price}</div>
              <div style="font-size:11px;color:#6b7280;margin-bottom:6px">📍 ${p.location}</div>
              <div style="font-size:11px;color:#555;margin-bottom:8px">
                ${p.beds > 0 ? `🛏 ${p.beds} ` : ""}${p.baths > 0 ? `🚿 ${p.baths} ` : ""}📐 ${p.area.toLocaleString()} sqft
              </div>
              <button id="view-prop-${p.id}" style="
                width:100%;background:${color};color:#fff;border:none;
                padding:8px;border-radius:8px;font-weight:800;font-size:12px;cursor:pointer;
              ">View Details →</button>
            </div>
          `)
          .openOn(map);

        // Wire up the button after popup renders
        setTimeout(() => {
          const btn = document.getElementById(`view-prop-${p.id}`);
          if (btn) btn.onclick = () => { onSelect(p); map.closePopup(); };
        }, 100);
      });

      markersRef.current.push(marker);
    });

    // Fit map to markers if any
    if (markersRef.current.length > 0) {
      try {
        const group = L.featureGroup(markersRef.current);
        map.fitBounds(group.getBounds().pad(0.2));
      } catch(e) {}
    }
  };

  return (
    <div ref={mapRef} style={{
      width: "100%",
      height: "520px",
      borderRadius: "0 0 16px 16px",
      zIndex: 1,
    }} />
  );
}

/* ── ABOUT MODAL ─────────────────────────────── */
function AboutModal({onClose, lang="en"}){
  const isMobile = useIsMobile();
  const isBn = lang==="bn";
  const t = (en,bn)=>isBn?bn:en;

  const points = [
    ["🔍", t("Find a home","বাসা খুঁজুন"), t("Browse rentals and properties for sale across all 8 divisions of Bangladesh. Filter by area, type, budget and amenities.","বাংলাদেশের ৮টি বিভাগ জুড়ে ভাড়া ও বিক্রয়ের সম্পত্তি দেখুন। এলাকা, ধরন, বাজেট ও সুবিধা অনুযায়ী ফিল্টার করুন।")],
    ["🏠", t("List your property","সম্পত্তি তালিকাভুক্ত করুন"), t("Owners and agents can list a property for free in minutes, add photos, and set inspection times.","মালিক ও এজেন্টরা বিনামূল্যে কয়েক মিনিটে সম্পত্তি তালিকাভুক্ত করতে, ছবি যোগ করতে ও পরিদর্শনের সময় নির্ধারণ করতে পারেন।")],
    ["📅", t("Book inspections","পরিদর্শন বুক করুন"), t("Tenants can request a viewing directly from a listing, and owners manage all bookings from their dashboard.","ভাড়াটিয়ারা সরাসরি তালিকা থেকে পরিদর্শনের অনুরোধ করতে পারেন, এবং মালিকরা ড্যাশবোর্ড থেকে সব বুকিং পরিচালনা করেন।")],
    ["📊", t("Track performance","পারফরম্যান্স ট্র্যাক করুন"), t("Owners see views, saves and enquiries for each listing, helping them understand demand.","মালিকরা প্রতিটি তালিকার ভিউ, সেভ ও জিজ্ঞাসা দেখেন, যা চাহিদা বুঝতে সাহায্য করে।")],
  ];

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:isMobile?"flex-end":"center",justifyContent:"center",padding:isMobile?0:20}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:isMobile?"18px 18px 0 0":16,maxWidth:560,width:"100%",maxHeight:"90vh",overflowY:"auto"}}>
        {/* Header */}
        <div style={{background:`linear-gradient(135deg,${T.red},#8f0a1f)`,color:"#fff",padding:isMobile?"22px 20px":"26px 28px",borderRadius:isMobile?"18px 18px 0 0":"16px 16px 0 0",position:"relative"}}>
          <button onClick={onClose} style={{position:"absolute",top:14,right:14,background:"rgba(255,255,255,0.18)",border:"none",borderRadius:"50%",width:32,height:32,color:"#fff",fontSize:16,cursor:"pointer"}}>✕</button>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:900,marginBottom:6}}>Basha<span style={{opacity:.85}}>.app</span></div>
          <div style={{fontSize:14,opacity:.9,lineHeight:1.6}}>{t("Bangladesh's rental & property portal — find a home or list yours, across all 8 divisions.","বাংলাদেশের ভাড়া ও সম্পত্তির পোর্টাল — ৮টি বিভাগ জুড়ে বাসা খুঁজুন বা তালিকাভুক্ত করুন।")}</div>
        </div>
        {/* Body */}
        <div style={{padding:isMobile?"20px":"24px 28px"}}>
          <div style={{fontSize:14,color:T.text,lineHeight:1.7,marginBottom:18}}>
            {t("Basha.app connects renters, buyers, property owners and agents across Bangladesh in one simple place. Whether you are looking for a flat in Dhaka, a family home in Chittagong, or want to list a vacant property, Basha.app is built to make it straightforward — in both Bangla and English.","Basha.app বাংলাদেশের ভাড়াটিয়া, ক্রেতা, সম্পত্তির মালিক ও এজেন্টদের এক সহজ জায়গায় সংযুক্ত করে। আপনি ঢাকায় ফ্ল্যাট খুঁজছেন, চট্টগ্রামে পারিবারিক বাসা চান, নাকি খালি সম্পত্তি তালিকাভুক্ত করতে চান — Basha.app তা সহজ করতে তৈরি, বাংলা ও ইংরেজি উভয় ভাষায়।")}
          </div>
          {points.map(([icon,title,desc])=>(
            <div key={title} style={{display:"flex",gap:13,marginBottom:15,alignItems:"flex-start"}}>
              <div style={{fontSize:24,flexShrink:0}}>{icon}</div>
              <div>
                <div style={{fontWeight:800,fontSize:14,color:T.text,marginBottom:2}}>{title}</div>
                <div style={{fontSize:13,color:T.muted,lineHeight:1.6}}>{desc}</div>
              </div>
            </div>
          ))}
          <div style={{background:T.greenL,border:`1px solid ${T.greenM}`,borderRadius:11,padding:"13px 15px",fontSize:12.5,color:T.green,fontWeight:600,marginTop:6,lineHeight:1.6}}>
            📱 {t("Android and iOS apps are coming soon — so you can search and book on the go.","অ্যান্ড্রয়েড ও আইওএস অ্যাপ শীঘ্রই আসছে — যাতে আপনি চলার পথে সার্চ ও বুক করতে পারেন।")}
          </div>
          <div style={{textAlign:"center",fontSize:11,color:T.muted,marginTop:18}}>
            🇧🇩 {t("Built for Bangladesh · Dhaka","বাংলাদেশের জন্য তৈরি · ঢাকা")}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN APP ─────────────────────────────────── */
export default function App(){
  const isMobile = useIsMobile();
  const { showBanner:showPWA, isIOS, install:installPWA, dismiss:dismissPWA } = usePWAInstall();
  const [lang,setLang]           = useState("en");
  const [search,setSearch]       = useState("");
  const [status,setStatus]       = useState("all");
  const [typeF,setTypeF]         = useState("All Types");
  const [divF,setDivF]           = useState("All Divisions");
  const [activeQ,setActiveQ]     = useState([]);
  const [selected,setSelected]   = useState(null);
  const [showWizard,setShowWizard] = useState(false);
  const [editingProp,setEditingProp] = useState(null);
  const [sortBy,setSortBy]       = useState("featured");
  const [budgetMax,setBudgetMax] = useState("");
  const [showAdv,setShowAdv]     = useState(false);
  const [showSugg,setShowSugg]   = useState(false);
  const [mainTab,setMainTab]     = useState("tenant");
  // Auth
  const [user,setUser]           = useState(null);
  const [showAuth,setShowAuth]   = useState(false);
  const [authMode,setAuthMode]   = useState("signin");
  const [showOwnerDash,setShowOwnerDash] = useState(false);
  const [showTenantDash,setShowTenantDash] = useState(false);
  // ── FIX: showMap state (was missing — caused "Can't find variable: showMap") ──
  const [showMap,setShowMap]     = useState(false);
  const [showAbout,setShowAbout] = useState(false);
  const [viewMode,setViewMode]   = useState("list"); // "list" | "map"
  // Custom areas added by property listers — persisted in localStorage
  const [customAreas, setCustomAreas] = useState(()=>{
    try {
      const saved = localStorage.getItem("basha_custom_areas");
      return saved ? JSON.parse(saved) : [];
    } catch(e){ return []; }
  });
  const handleAddArea = (newArea) => {
    setCustomAreas(prev => {
      const already = prev.some(a=>a.label.toLowerCase()===newArea.label.toLowerCase());
      if(already) return prev;
      const updated = [...prev, newArea];
      try { localStorage.setItem("basha_custom_areas", JSON.stringify(updated)); } catch(e){}
      return updated;
    });
  };
  // User-created property listings — persisted in localStorage
  const [userProps, setUserProps] = useState([]);

  // Load real listings from Supabase on startup
  useEffect(()=>{
    if(!supabase) return;
    (async()=>{
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending:false });
      if(error){ console.error("Load listings failed:", error.message); return; }
      if(data) setUserProps(data.map(dbRowToProp));
    })();
  },[]);

  const handleAddProperty = async (form) => {
    if(!supabase){ alert("Database not connected. Please try again later."); return; }
    try {
      const photoUrls = await uploadPhotos(form.photos);
      const row = formToDbRow(form, photoUrls);
      row.owner_email = (typeof user!=="undefined" && user && user.email) ? user.email : "";
      if(typeof user!=="undefined" && user && user.id) row.owner_id = user.id;
      const { data, error } = await supabase.from("properties").insert(row).select().single();
      if(error){ console.error("Add listing failed:", error.message); alert("Could not publish listing: "+error.message); return; }
      if(data) setUserProps(prev => [dbRowToProp(data), ...prev]);
    } catch(e){ console.error(e); alert("Something went wrong publishing your listing."); }
  };

  const handleDeleteProperty = async (id) => {
    if(!supabase) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if(error){ console.error("Delete failed:", error.message); alert("Could not delete listing: "+error.message); return; }
    setUserProps(prev => prev.filter(p => p.id !== id));
  };

  const handleEditProperty = async (id, form) => {
    if(!supabase) return;
    try {
      const photoUrls = await uploadPhotos(form.photos);
      const row = formToDbRow(form, photoUrls);
      delete row.views; // don't reset views on edit
      const { data, error } = await supabase.from("properties").update(row).eq("id", id).select().single();
      if(error){ console.error("Edit failed:", error.message); alert("Could not update listing: "+error.message); return; }
      if(data) setUserProps(prev => prev.map(p => p.id===id ? dbRowToProp(data) : p));
    } catch(e){ console.error(e); alert("Something went wrong updating your listing."); }
  };

  // Saved & history
  const [savedIds,setSavedIds]   = useState([1,6]);
  const [searchHistory,setSearchHistory] = useState([
    {query:"Gulshan",filters:"Apartment · Dhaka",time:"2h ago"},
    {query:"Dhanmondi",filters:"For Rent · All Types",time:"Yesterday"},
    {query:"",filters:"Apartment · Chittagong",time:"2 days ago"},
  ]);

  const L = LANG[lang];
  const QUICK_FILTERS = lang==="bn" ? QUICK_FILTERS_BN : QUICK_FILTERS_EN;
  const DIVISIONS = lang==="bn" ? DIVISIONS_BN : DIVISIONS_EN;
  const PTYPES = lang==="bn" ? PTYPES_BN : PTYPES_EN;
  const toggleQ = k=>setActiveQ(p=>p.includes(k)?p.filter(x=>x!==k):[...p,k]);

  const handleSelectProperty = (p) => {
    Analytics.track("view", {propId: p.id, title: p.title, location: p.location});
    setSelected(p);
  };
  const handleSaveToggle = id => {
    setSavedIds(prev => {
      const saving = !prev.includes(id);
      if(saving) Analytics.track("save", {propId:id});
      return saving ? [...prev, id] : prev.filter(x=>x!==id);
    });
  };

  const handleLogin = async (u, isNew=false) => {
    setUser(u);
    if(isNew){
      try {
        await fetch("/api/send-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"welcome",data:{email:u.email,name:u.name,role:u.role}})});
      } catch(e){}
    }
    const isAdminUser = u.email && u.email.toLowerCase()==="monjur111@gmail.com";
    if(u.role==="owner"||u.role==="agent"||isAdminUser) setShowOwnerDash(true);
    else setShowTenantDash(true);
  };

  const handleLogout = async () => {
    try { if(supabase) await supabase.auth.signOut(); } catch(e){}
    setUser(null);
    setShowOwnerDash(false);
    setShowTenantDash(false);
  };

  // One account can use both views — switch freely
  const switchToOwner = () => { setShowTenantDash(false); setShowOwnerDash(true); };
  const switchToTenant = () => { setShowOwnerDash(false); setShowTenantDash(true); };

  // Restore an existing login session on app load (stay logged in across refreshes)
  useEffect(()=>{
    if(!supabase) return;
    supabase.auth.getSession().then(({ data })=>{
      const sess = data && data.session;
      if(sess && sess.user){
        const u = sess.user;
        const uname = (u.user_metadata && u.user_metadata.name) || u.email.split("@")[0];
        setUser({ id:u.id, name:uname, email:u.email, phone:"", role:"tenant", avatar:uname[0].toUpperCase() });
      }
    });
  },[]);

  const ALL_PROPS = [...userProps, ...PROPERTIES];
  const filtered = ALL_PROPS.filter(p=>{
    if(search&&!p.title.toLowerCase().includes(search.toLowerCase())&&!p.location.toLowerCase().includes(search.toLowerCase())) return false;
    if(status!=="all"&&p.status!==status) return false;
    if(typeF!=="All Types"&&p.type!==typeF.toLowerCase()) return false;
    if(divF!=="All Divisions"&&p.division!==divF) return false;
    if(budgetMax&&p.price>Number(budgetMax)) return false;
    if(activeQ.includes("furnished")&&!p.tags.some(t=>t.toLowerCase().includes("furnished"))) return false;
    if(activeQ.includes("pet")&&!p.petFriendly) return false;
    if(activeQ.includes("flatmate")&&!p.flatmate) return false;
    if(activeQ.includes("parking")&&p.cars<1) return false;
    if(activeQ.includes("gen")&&!p.tags.some(t=>t.includes("Gen")||t.includes("Generator"))) return false;
    if(activeQ.includes("ac")&&!p.tags.some(t=>t.includes("AC"))) return false;
    if(activeQ.includes("gym")&&!p.tags.some(t=>t.includes("Gym")||t.includes("Pool"))) return false;
    if(activeQ.includes("wifi")&&!p.utilities.includes("WiFi")) return false;
    return true;
  }).sort((a,b)=>{
    if(sortBy==="price-asc") return a.price-b.price;
    if(sortBy==="price-desc") return b.price-a.price;
    if(sortBy==="newest") return a.age-b.age;
    return (b.featured?1:0)-(a.featured?1:0);
  });

  const Pill=({children,active,onClick})=>(
    <button onClick={onClick} style={{padding:"6px 13px",borderRadius:20,border:"1.5px solid",cursor:"pointer",fontWeight:700,fontSize:12,flexShrink:0,transition:"all .15s",borderColor:active?T.red:"#d1d5db",background:active?T.redL:"#fff",color:active?T.red:"#555"}}>
      {children}
    </button>
  );

  return (
    <div style={{fontFamily:"'DM Sans','Segoe UI',sans-serif",minHeight:"100vh",background:T.bg,color:T.text}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>

      {/* HEADER */}
      <header style={{background:"#fff",borderBottom:`1px solid ${T.border}`,padding:isMobile?"0 14px":"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:isMobile?54:60,position:"sticky",top:0,zIndex:500,boxShadow:"0 1px 8px rgba(0,0,0,0.07)"}}>
        <div style={{display:"flex",alignItems:"center",gap:7,userSelect:"none"}}>
          <div style={{borderRadius:8,width:isMobile?30:36,height:isMobile?30:36,overflow:"hidden",flexShrink:0}}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
              <rect width="512" height="512" rx="110" fill="#0f2d1a"/>
              <circle cx="400" cy="112" r="88" fill="#C8102E"/>
              <rect x="96" y="210" width="320" height="240" rx="6" fill="#ffffff"/>
              <rect x="86" y="198" width="340" height="22" rx="4" fill="#e8e8e8"/>
              <line x1="96" y1="280" x2="416" y2="280" stroke="#e0e0e0" strokeWidth="2"/>
              <line x1="96" y1="348" x2="416" y2="348" stroke="#e0e0e0" strokeWidth="2"/>
              <line x1="202" y1="210" x2="202" y2="450" stroke="#e0e0e0" strokeWidth="2"/>
              <line x1="310" y1="210" x2="310" y2="450" stroke="#e0e0e0" strokeWidth="2"/>
              <rect x="114" y="224" width="68" height="46" rx="4" fill="#C8102E" opacity="0.85"/>
              <line x1="148" y1="224" x2="148" y2="270" stroke="white" strokeWidth="2.5"/>
              <line x1="114" y1="247" x2="182" y2="247" stroke="white" strokeWidth="2.5"/>
              <rect x="220" y="224" width="68" height="46" rx="4" fill="#C8102E" opacity="0.85"/>
              <line x1="254" y1="224" x2="254" y2="270" stroke="white" strokeWidth="2.5"/>
              <line x1="220" y1="247" x2="288" y2="247" stroke="white" strokeWidth="2.5"/>
              <rect x="326" y="224" width="68" height="46" rx="4" fill="#C8102E" opacity="0.85"/>
              <line x1="360" y1="224" x2="360" y2="270" stroke="white" strokeWidth="2.5"/>
              <line x1="326" y1="247" x2="394" y2="247" stroke="white" strokeWidth="2.5"/>
              <rect x="114" y="294" width="68" height="46" rx="4" fill="#1a6b3c" opacity="0.85"/>
              <line x1="148" y1="294" x2="148" y2="340" stroke="white" strokeWidth="2.5"/>
              <line x1="114" y1="317" x2="182" y2="317" stroke="white" strokeWidth="2.5"/>
              <rect x="220" y="294" width="68" height="46" rx="4" fill="#1a6b3c" opacity="0.85"/>
              <line x1="254" y1="294" x2="254" y2="340" stroke="white" strokeWidth="2.5"/>
              <line x1="220" y1="317" x2="288" y2="317" stroke="white" strokeWidth="2.5"/>
              <rect x="326" y="294" width="68" height="46" rx="4" fill="#1a6b3c" opacity="0.85"/>
              <line x1="360" y1="294" x2="360" y2="340" stroke="white" strokeWidth="2.5"/>
              <line x1="326" y1="317" x2="394" y2="317" stroke="white" strokeWidth="2.5"/>
              <rect x="114" y="362" width="68" height="46" rx="4" fill="#C8102E" opacity="0.85"/>
              <line x1="148" y1="362" x2="148" y2="408" stroke="white" strokeWidth="2.5"/>
              <line x1="114" y1="385" x2="182" y2="385" stroke="white" strokeWidth="2.5"/>
              <rect x="326" y="362" width="68" height="46" rx="4" fill="#C8102E" opacity="0.85"/>
              <line x1="360" y1="362" x2="360" y2="408" stroke="white" strokeWidth="2.5"/>
              <line x1="326" y1="385" x2="394" y2="385" stroke="white" strokeWidth="2.5"/>
              <rect x="210" y="406" width="92" height="44" rx="5" fill="#F5C842"/>
              <rect x="76" y="448" width="360" height="8" rx="2" fill="#F5C842"/>
            </svg>
          </div>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontWeight:900,fontSize:isMobile?16:18,color:T.text,lineHeight:1}}>Basha<span style={{color:T.red}}>.app</span></div>
          </div>
        </div>
        {/* Desktop nav — Map view toggle */}
        {!isMobile&&(
          <nav style={{display:"flex",gap:1}}>
            <button
              onClick={()=>{ setShowMap(s=>!s); setViewMode(v=>v==="map"?"list":"map"); }}
              style={{padding:"5px 12px",border:"none",background:showMap?T.redL:"transparent",cursor:"pointer",fontWeight:600,fontSize:12,color:showMap?T.red:T.muted,borderRadius:8,transition:"all .15s"}}>
              🗺 Map
            </button>
          </nav>
        )}
        <div style={{display:"flex",gap:isMobile?7:9,alignItems:"center"}}>
          <button onClick={()=>setLang(l=>l==="en"?"bn":"en")} style={{background:T.greenL,border:`1px solid ${T.greenM}`,borderRadius:12,padding:isMobile?"3px 8px":"4px 10px",color:T.green,fontSize:isMobile?9:11,fontWeight:800,cursor:"pointer"}}>
            {L.langBtn}
          </button>
          {user?(
            <button onClick={()=>(user.role==="owner"||user.role==="agent")?setShowOwnerDash(true):setShowTenantDash(true)}
              style={{background:(user.role==="owner"||user.role==="agent")?T.greenL:T.redL,color:(user.role==="owner"||user.role==="agent")?T.green:T.red,border:`1.5px solid ${(user.role==="owner"||user.role==="agent")?T.greenM:T.redM}`,padding:isMobile?"5px 10px":"7px 14px",borderRadius:20,fontWeight:700,fontSize:isMobile?11:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:isMobile?20:24,height:isMobile?20:24,background:(user.role==="owner"||user.role==="agent")?T.green:T.red,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:isMobile?10:12,fontWeight:900}}>{user.avatar}</div>
              {isMobile?"Me":"My Dashboard"}
            </button>
          ):(
            <button onClick={()=>{setAuthMode("signin");setShowAuth(true);}} style={{background:"#fff",color:T.red,border:`1.5px solid ${T.red}`,padding:isMobile?"6px 12px":"8px 16px",borderRadius:20,fontWeight:700,fontSize:isMobile?11:12,cursor:"pointer"}}>
              Sign In
            </button>
          )}
          {!isMobile&&(
            <button onClick={()=>user?setShowWizard(true):(setAuthMode("signup"),setShowAuth(true))} style={{background:T.red,color:"#fff",border:"none",padding:"9px 18px",borderRadius:20,fontWeight:800,fontSize:12,cursor:"pointer",boxShadow:"0 2px 10px rgba(200,16,46,0.3)"}}>
              {L.listBtn}
            </button>
          )}
        </div>
      </header>

      {/* HERO */}
      <div style={{background:"linear-gradient(160deg,#fff 0%,#fff8f8 45%,#f0faf4 100%)",borderBottom:`1px solid ${T.border}`,padding:isMobile?"20px 16px 28px":"32px 20px 40px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-70,right:-70,width:240,height:240,background:"rgba(200,16,46,0.05)",borderRadius:"50%"}}/>
        <div style={{position:"absolute",bottom:-50,left:-50,width:200,height:200,background:"rgba(26,107,60,0.06)",borderRadius:"50%"}}/>
        <div style={{position:"relative",textAlign:"center"}}>
          <div style={{display:"inline-flex",background:"#f1f3f5",borderRadius:13,padding:4,marginBottom:22,gap:3}}>
            <button onClick={()=>{setMainTab("tenant");setStatus("for-rent");}} style={{padding:"9px 22px",borderRadius:9,border:"none",cursor:"pointer",fontWeight:800,fontSize:13,transition:"all .2s",background:mainTab==="tenant"?T.red:"transparent",color:mainTab==="tenant"?"#fff":"#666",boxShadow:mainTab==="tenant"?"0 2px 10px rgba(200,16,46,0.25)":"none"}}>
              {L.tenantMode}
            </button>
            <button onClick={()=>{setMainTab("owner");}} style={{padding:"9px 22px",borderRadius:9,border:"none",cursor:"pointer",fontWeight:800,fontSize:13,transition:"all .2s",background:mainTab==="owner"?T.green:"transparent",color:mainTab==="owner"?"#fff":"#666",boxShadow:mainTab==="owner"?"0 2px 10px rgba(26,107,60,0.25)":"none"}}>
              {L.ownerMode}
            </button>
          </div>

          {mainTab==="owner"?(
            <div>
              <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:isMobile?26:36,fontWeight:900,margin:"0 0 10px",color:T.text,lineHeight:1.1}}>
                {L.heroO1}<br/><span style={{color:T.green}}>{L.heroO2}</span>
              </h1>
              <p style={{fontSize:15,color:T.muted,marginBottom:24}}>{L.heroOSub}</p>
              <div style={{display:"flex",justifyContent:"center",gap:12,marginBottom:26,flexWrap:"wrap"}}>
                {["✅ 100% Free","⚡ Live in Minutes","📞 Direct Contact","📅 Inspection Times","🔒 Verified Tenants"].map(t=>(
                  <div key={t} style={{background:"#fff",border:`1px solid ${T.border}`,borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:700,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>{t}</div>
                ))}
              </div>
              {user?(
                <button onClick={()=>setShowOwnerDash(true)} style={{background:T.green,color:"#fff",border:"none",padding:"15px 44px",borderRadius:13,fontWeight:900,fontSize:16,cursor:"pointer",boxShadow:"0 4px 20px rgba(26,107,60,0.3)"}}>
                  📊 Go to My Dashboard →
                </button>
              ):(
                <button onClick={()=>{setAuthMode("signup");setShowAuth(true);}} style={{background:T.green,color:"#fff",border:"none",padding:"15px 44px",borderRadius:13,fontWeight:900,fontSize:16,cursor:"pointer",boxShadow:"0 4px 20px rgba(26,107,60,0.3)"}}>
                  {L.startFree}
                </button>
              )}
            </div>
          ):(
            <div>
              <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:isMobile?26:36,fontWeight:900,margin:"0 0 10px",color:T.text,lineHeight:1.1}}>
                {L.heroT1} <span style={{color:T.red}}>{L.heroT2}</span><br/>{L.heroT3}
              </h1>
              <p style={{fontSize:15,color:T.muted,marginBottom:24}}>{L.heroTSub}</p>
              <div style={{background:"#fff",borderRadius:16,padding:isMobile?"14px 14px":"18px 20px",maxWidth:860,margin:"0 auto",boxShadow:"0 6px 40px rgba(0,0,0,0.1)",border:`1px solid ${T.border}`}}>
                <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
                  {[
              [lang==="bn"?"🔑 ভাড়া":"🔑 Rent","for-rent"],
              [lang==="bn"?"🏢 কিনুন":"🏢 Buy","for-sale"],
              [lang==="bn"?"📊 সব":"📊 All","all"]
            ].map(([label,val])=>(
                    <button key={val} onClick={()=>setStatus(val)} style={{padding:"6px 14px",borderRadius:8,border:"1.5px solid",cursor:"pointer",fontWeight:700,fontSize:12,borderColor:status===val?T.red:T.border,background:status===val?T.red:"#fff",color:status===val?"#fff":"#555"}}>{label}</button>
                  ))}
                  <button onClick={()=>setShowAdv(!showAdv)} style={{marginLeft:"auto",padding:"6px 13px",border:`1.5px solid ${T.border}`,borderRadius:8,background:"#fff",cursor:"pointer",fontSize:12,fontWeight:600,color:T.muted}}>{L.filtersBtn} {showAdv?"▲":"▼"}</button>
                </div>
                <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
                  {/* Autocomplete search input */}
                  <div style={{flex:"2 1 180px",position:"relative"}}>
                    <input
                      value={search}
                      onChange={e=>{
                        setSearch(e.target.value);
                        setShowSugg(true);
                        if(e.target.value.length>=2) Analytics.track("search",{query:e.target.value});
                      }}
                      onFocus={()=>setShowSugg(true)}
                      onBlur={()=>setTimeout(()=>setShowSugg(false),180)}
                      placeholder={L.searchPh}
                      style={{width:"100%",padding:"11px 14px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:13,outline:"none",boxSizing:"border-box"}}
                    />
                    {/* Autocomplete dropdown */}
                    {showSugg && search.length>=1 &&
                      <SearchDropdown
                        search={search}
                        customAreas={customAreas}
                        onSelect={(label)=>{setSearch(label);setShowSugg(false);}}
                      />
                    }
                  </div>
                  <select value={typeF} onChange={e=>setTypeF(e.target.value)} style={{flex:"1 1 110px",padding:"11px 9px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:12,color:"#444",background:"#fff"}}>
                    {PTYPES.map(p=><option key={p}>{p}</option>)}
                  </select>
                  <select value={divF} onChange={e=>setDivF(e.target.value)} style={{flex:"1 1 120px",padding:"11px 9px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:12,color:"#444",background:"#fff"}}>
                    {DIVISIONS.map(d=><option key={d}>{d}</option>)}
                  </select>
                  <button style={{background:T.red,color:"#fff",border:"none",padding:"11px 22px",borderRadius:9,fontWeight:800,fontSize:14,cursor:"pointer"}}>{L.searchBtn}</button>
                </div>
                {showAdv&&(
                  <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid #f0f0f0"}}>
                    <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",marginBottom:12}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:13,fontWeight:700,color:T.muted}}>{L.filtersBtn==="⚙ Filters"?"Max ৳/mo:":"সর্বোচ্চ ৳/মাস:"}</span>
                        <input type="number" value={budgetMax} onChange={e=>setBudgetMax(e.target.value)} placeholder="e.g. 30000" style={{width:110,padding:"8px 10px",border:`1.5px solid ${T.border}`,borderRadius:8,fontSize:13,outline:"none"}}/>
                      </div>
                      <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{padding:"8px 10px",border:`1.5px solid ${T.border}`,borderRadius:8,fontSize:13,color:"#444",background:"#fff"}}>
                        <option value="featured">{lang==="bn"?"ফিচার্ড প্রথমে":"Featured First"}</option>
                        <option value="newest">{lang==="bn"?"সর্বশেষ":"Newest"}</option>
                        <option value="price-asc">{lang==="bn"?"মূল্য ↑":"Price ↑"}</option>
                        <option value="price-desc">{lang==="bn"?"মূল্য ↓":"Price ↓"}</option>
                      </select>
                      <button onClick={()=>{setSearch("");setStatus("all");setTypeF("All Types");setDivF("All Divisions");setBudgetMax("");setActiveQ([]);}} style={{marginLeft:"auto",padding:"8px 14px",border:`1.5px solid ${T.border}`,borderRadius:8,background:"#fff",cursor:"pointer",fontSize:13,fontWeight:600,color:T.muted}}>{L.resetBtn}</button>
                    </div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                      <span style={{fontSize:11,fontWeight:800,color:T.muted,letterSpacing:0.5,marginRight:2,width:"100%"}}>{L.quickLabel}</span>
                      {QUICK_FILTERS.map(f=><Pill key={f.key} active={activeQ.includes(f.key)} onClick={()=>toggleQ(f.key)}>{f.label}</Pill>)}
                      {activeQ.length>0&&<Pill onClick={()=>setActiveQ([])}>{L.clearAll}</Pill>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {user&&user.role!=="owner"&&(
            <div style={{marginTop:16,background:T.greenL,border:`1px solid ${T.greenM}`,borderRadius:12,padding:"10px 16px",display:"inline-flex",alignItems:"center",gap:10,fontSize:13}}>
              <span style={{fontSize:18}}>✨</span>
              <span style={{color:T.green,fontWeight:600}}>3 new properties match your interests! </span>
              <span onClick={()=>setShowTenantDash(true)} style={{color:T.green,fontWeight:800,cursor:"pointer",textDecoration:"underline"}}>View suggestions →</span>
            </div>
          )}
        </div>
      </div>

      {/* MAIN */}
      <div style={{maxWidth:1220,margin:"0 auto",padding:isMobile?"16px 12px":"24px 18px"}}>

        {mainTab==="owner"&&(
          <div style={{marginBottom:32}}>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:21,fontWeight:900,margin:"0 0 16px"}}>How Basha.app Works for Owners</h2>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(auto-fit,minmax(190px,1fr))",gap:isMobile?10:14}}>
              {[["1","📋","Create Your Listing","Fill details, set inspection times, upload photos — under 5 mins"],
                ["2","⚡","Go Live Instantly","Reaches thousands of active renters immediately"],
                ["3","📅","Manage Inspections","Tenants book from your available times — you get notified"],
                ["4","📊","Track Performance","See views, saves & messages per property in your dashboard"]].map(([num,icon,title,desc])=>(
                <div key={num} style={{background:"#fff",border:`1px solid ${T.border}`,borderRadius:13,padding:"18px 16px",position:"relative",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
                  <div style={{position:"absolute",top:13,right:13,width:24,height:24,background:T.greenL,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:T.green}}>{num}</div>
                  <div style={{fontSize:26,marginBottom:7}}>{icon}</div>
                  <div style={{fontWeight:800,fontSize:13,color:T.text,marginBottom:4}}>{title}</div>
                  <div style={{fontSize:11,color:T.muted,lineHeight:1.6}}>{desc}</div>
                </div>
              ))}
            </div>
            <div style={{textAlign:"center",marginTop:16}}>
              {user?(
                <button onClick={()=>setShowOwnerDash(true)} style={{background:T.green,color:"#fff",border:"none",padding:"12px 34px",borderRadius:11,fontWeight:900,fontSize:14,cursor:"pointer"}}>📊 Open My Dashboard</button>
              ):(
                <button onClick={()=>{setAuthMode("signup");setShowAuth(true);}} style={{background:T.green,color:"#fff",border:"none",padding:"12px 34px",borderRadius:11,fontWeight:900,fontSize:14,cursor:"pointer"}}>📋 Register & Start Listing</button>
              )}
            </div>
          </div>
        )}

        {/* Results header with List / Map toggle */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:18,flexWrap:"wrap",gap:12}}>
          <div>
            <h2 style={{margin:0,fontSize:22,fontWeight:800,fontFamily:"'Playfair Display',serif"}}>{filtered.length} {lang==="bn"?"টি সম্পত্তি":"Properties"}{divF!=="All Divisions"?` in ${divF}`:""}</h2>
            <div style={{fontSize:13,color:T.muted,marginTop:3}}>{status==="for-rent"?(lang==="bn"?"ভাড়া":"Rentals"):status==="for-sale"?(lang==="bn"?"বিক্রয়":"For Sale"):(lang==="bn"?"সকল তালিকা":"All Listings")}</div>
          </div>
          <div style={{display:"flex",gap:14,alignItems:"center",flexWrap:"wrap"}}>
            {/* Status segmented control */}
            <div style={{display:"flex",background:"#fff",border:`1.5px solid ${T.border}`,borderRadius:11,padding:3,gap:2}}>
              {[
              [lang==="bn"?"সব":"All","all"],
              [lang==="bn"?"ভাড়া":"For Rent","for-rent"],
              [lang==="bn"?"বিক্রয়":"For Sale","for-sale"]
            ].map(([label,val])=>(
                <button key={label} onClick={()=>setStatus(val)} style={{padding:"7px 15px",border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13,background:status===val?T.red:"transparent",color:status===val?"#fff":T.muted,transition:"all .15s"}}>{label}</button>
              ))}
            </div>
            {/* List / Map view toggle */}
            <div style={{display:"flex",background:"#fff",border:`1.5px solid ${T.border}`,borderRadius:11,padding:3,gap:2}}>
              <button onClick={()=>setViewMode("list")} style={{padding:"7px 15px",border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13,background:viewMode==="list"?T.text:"transparent",color:viewMode==="list"?"#fff":T.muted,transition:"all .15s"}}>
                {lang==="bn"?"🏠 তালিকা":"🏠 List"}
              </button>
              <button onClick={()=>setViewMode("map")} style={{padding:"7px 15px",border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13,background:viewMode==="map"?T.green:"transparent",color:viewMode==="map"?"#fff":T.muted,transition:"all .15s"}}>
                {lang==="bn"?"🗺 মানচিত্র":"🗺 Map"}
              </button>
            </div>
          </div>
        </div>

        {/* MAP VIEW */}
        {viewMode==="map" && (
          <div style={{borderRadius:16,overflow:"hidden",border:`1px solid ${T.border}`,boxShadow:"0 4px 24px rgba(0,0,0,0.1)",marginBottom:32}}>
            {/* Map header */}
            <div style={{background:T.green,padding:"12px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{color:"#fff",fontWeight:800,fontSize:14}}>🗺 Property Map — Bangladesh</div>
                <div style={{color:"rgba(255,255,255,0.75)",fontSize:11,marginTop:2}}>{filtered.length} {lang==="bn"?"টি সম্পত্তি · পিন ক্লিক করুন":"properties shown · Click a pin to view details"}</div>
              </div>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <span style={{background:"#1a6b3c",color:"#fff",fontSize:9,fontWeight:800,padding:"2px 8px",borderRadius:10,border:"2px solid #fff"}}>FOR RENT</span>
                  <span style={{background:"#C8102E",color:"#fff",fontSize:9,fontWeight:800,padding:"2px 8px",borderRadius:10,border:"2px solid #fff"}}>FOR SALE</span>
                </div>
                <button onClick={()=>setViewMode("list")} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:20,padding:"5px 12px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>← {lang==="bn"?"তালিকা":"List View"}</button>
              </div>
            </div>
            {/* Leaflet map */}
            <LeafletMap
              properties={filtered}
              onSelect={handleSelectProperty}
              savedIds={savedIds}
              onSaveToggle={handleSaveToggle}
            />
          </div>
        )}

        {/* LIST VIEW */}
        {viewMode==="list" && (
          <>
            {filtered.length>0?(
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(auto-fill,minmax(280px,1fr))",gap:isMobile?14:18}}>
                {filtered.map(p=><Card key={p.id} p={p} onSelect={handleSelectProperty} savedIds={savedIds} onSaveToggle={handleSaveToggle} lang={lang} L={L}/>)}
              </div>
            ):(
              <div style={{textAlign:"center",padding:"56px 0",color:T.muted}}>
                <div style={{fontSize:48,marginBottom:10}}>🏚</div>
                <div style={{fontSize:17,fontWeight:700}}>{L.noMatch}</div>
                <button onClick={()=>{setSearch("");setActiveQ([]);setBudgetMax("");setStatus("all");}} style={{marginTop:12,background:T.red,color:"#fff",border:"none",padding:"9px 22px",borderRadius:18,fontWeight:700,cursor:"pointer"}}>{L.clearFilters}</button>
              </div>
            )}
          </>
        )}

        {/* MOBILE APPS COMING SOON */}
        <div style={{marginTop:44}}>
          <div style={{background:`linear-gradient(135deg,${T.green},#0a3d22)`,borderRadius:16,padding:isMobile?"24px 20px":"30px 36px",color:"#fff",position:"relative",overflow:"hidden",display:"flex",flexDirection:isMobile?"column":"row",alignItems:"center",justifyContent:"space-between",gap:20}}>
            <div style={{position:"absolute",right:-30,top:-30,width:170,height:170,background:"rgba(255,255,255,0.05)",borderRadius:"50%"}}/>
            <div style={{position:"relative",textAlign:isMobile?"center":"left"}}>
              <div style={{fontSize:34,marginBottom:8}}>📱</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:isMobile?22:26,fontWeight:900,marginBottom:8}}>{L.appsTitle}</div>
              <div style={{opacity:.85,fontSize:14,lineHeight:1.6,maxWidth:440}}>{L.appsSub}</div>
            </div>
            <div style={{position:"relative",display:"flex",flexDirection:isMobile?"row":"column",gap:12,flexShrink:0}}>
              {[[L.appsAndroid,"🤖"],[L.appsIos,"🍎"]].map(([label,icon])=>(
                <div key={label} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:12,padding:isMobile?"10px 12px":"12px 18px",minWidth:isMobile?0:190}}>
                  <span style={{fontSize:24}}>{icon}</span>
                  <div style={{textAlign:"left"}}>
                    <div style={{fontSize:13,fontWeight:800,lineHeight:1.2}}>{label}</div>
                    <div style={{fontSize:10,opacity:.75,fontWeight:600,marginTop:2}}>⏳ {L.appsBadge}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div style={{marginTop:44}}>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:900,margin:"0 0 16px"}}>{L.rentingTips}</h2>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(auto-fit,minmax(210px,1fr))",gap:12}}>
            {[
              ["📄",L.verifyOwnership,L.verifyOwnershipDesc],
              ["✍️",L.writtenDeed,L.writtenDeedDesc],
              ["📅",L.bookInsp,L.bookInspDesc],
              ["🏛",L.checkRajuk,L.checkRajukDesc],
            ].map(([icon,title,desc])=>(
              <div key={title} style={{background:"#fff",border:`1px solid ${T.border}`,borderRadius:12,padding:"18px 16px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
                <div style={{fontSize:26,marginBottom:8}}>{icon}</div>
                <div style={{fontWeight:800,fontSize:15,color:T.text,marginBottom:5}}>{title}</div>
                <div style={{fontSize:13,color:T.muted,lineHeight:1.6}}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* GOVT LINKS */}
      <div style={{background:"#fff",borderTop:`2px solid ${T.border}`,marginTop:32}}>
        <div style={{maxWidth:1220,margin:"0 auto",padding:isMobile?"10px 14px":"12px 18px"}}>
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

      {/* HELPFUL GUIDES STRIP */}
      <section style={{background:"#f7fbf8",borderTop:`1px solid ${T.border}`,padding:"40px 20px"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:24}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:900,color:T.text,marginBottom:6}}>Helpful Guides for Renting & Buying</div>
            <div style={{fontSize:14,color:T.muted}}>Honest, practical advice on renting and property in Bangladesh — written for how the market really works.</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16}}>
            {[
              ["How to Find a Flat to Rent in Dhaka","The complete guide — how renting really works, and how to avoid the Facebook group games.","/blog/rent-flat-dhaka-guide"],
              ["Are Dhaka Rental Facebook Groups Safe?","What nobody tells you about how group admins control the listings you see.","/blog/dhaka-rental-facebook-groups"],
              ["Buying Land or a House in Bangladesh","How to avoid fake deeds, duplicate ownership, and dalal traps when buying.","/blog/buying-land-house-bangladesh"],
            ].map(([title,desc,url])=>(
              <a key={url} href={url} target="_blank" rel="noopener noreferrer" style={{display:"block",background:"#fff",border:`1px solid ${T.border}`,borderRadius:12,padding:"18px 20px",textDecoration:"none",boxShadow:"0 1px 4px rgba(0,0,0,0.05)",transition:"transform .15s,box-shadow .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.10)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.05)";}}>
                <div style={{fontWeight:800,fontSize:15,color:T.text,marginBottom:7,lineHeight:1.3}}>{title}</div>
                <div style={{fontSize:13,color:T.muted,lineHeight:1.5,marginBottom:10}}>{desc}</div>
                <span style={{fontSize:13,fontWeight:700,color:T.green}}>Read guide →</span>
              </a>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:22}}>
            <a href="/blog/" target="_blank" rel="noopener noreferrer" style={{display:"inline-block",background:T.green,color:"#fff",padding:"11px 26px",borderRadius:10,fontWeight:700,fontSize:14,textDecoration:"none"}}>View all guides →</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{background:"#0f1f16",color:"#6b8f7a",padding:"40px 20px 20px"}}>
        <div style={{maxWidth:1220,margin:"0 auto"}}>
          <div style={{display:"flex",gap:32,flexWrap:"wrap",marginBottom:28}}>
            <div style={{flex:"2 1 200px"}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:9}}>
                <div style={{borderRadius:7,width:28,height:28,overflow:"hidden",flexShrink:0}}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="28" height="28">
                    <rect width="512" height="512" rx="110" fill="#0f2d1a"/>
                    <circle cx="400" cy="112" r="88" fill="#C8102E"/>
                    <rect x="96" y="210" width="320" height="240" rx="6" fill="#ffffff"/>
                    <rect x="86" y="198" width="340" height="22" rx="4" fill="#e8e8e8"/>
                    <rect x="114" y="224" width="68" height="46" rx="4" fill="#C8102E" opacity="0.85"/>
                    <rect x="220" y="224" width="68" height="46" rx="4" fill="#C8102E" opacity="0.85"/>
                    <rect x="326" y="224" width="68" height="46" rx="4" fill="#C8102E" opacity="0.85"/>
                    <rect x="114" y="294" width="68" height="46" rx="4" fill="#1a6b3c" opacity="0.85"/>
                    <rect x="220" y="294" width="68" height="46" rx="4" fill="#1a6b3c" opacity="0.85"/>
                    <rect x="326" y="294" width="68" height="46" rx="4" fill="#1a6b3c" opacity="0.85"/>
                    <rect x="114" y="362" width="68" height="46" rx="4" fill="#C8102E" opacity="0.85"/>
                    <rect x="326" y="362" width="68" height="46" rx="4" fill="#C8102E" opacity="0.85"/>
                    <rect x="210" y="406" width="92" height="44" rx="5" fill="#F5C842"/>
                    <rect x="76" y="448" width="360" height="8" rx="2" fill="#F5C842"/>
                  </svg>
                </div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:900,color:"#fff"}}>Basha<span style={{color:T.red}}>.app</span></div>
              </div>
              <p style={{fontSize:12,lineHeight:1.8,color:"#4d7a5f",maxWidth:240}}>Bangladesh's most trusted rental & property portal across all 8 divisions.</p>
            </div>
            {(() => {
              const goTop = () => window.scrollTo({top:0,behavior:"smooth"});
              const needAuth = (after) => user ? after() : (setAuthMode("signin"), setShowAuth(true));
              const tenantArea = () => needAuth(()=>setShowTenantDash(true));
              const ownerArea = () => user ? ((user.role==="owner"||user.role==="agent")?setShowOwnerDash(true):setShowTenantDash(true)) : (setAuthMode("signup"), setShowAuth(true));
              const listProperty = () => user ? setShowWizard(true) : (setAuthMode("signup"), setShowAuth(true));
              const cols = [
                ["For Tenants",[
                  ["Search Rentals", ()=>{setStatus("for-rent");goTop();}],
                  ["Buy Property",   ()=>{setStatus("for-sale");goTop();}],
                  ["Book Inspections", tenantArea],
                  ["Saved Properties", tenantArea],
                  ["My Dashboard", tenantArea],
                ]],
                ["For Owners",[
                  ["List Property Free", listProperty],
                  ["Owner Dashboard", ownerArea],
                  ["Manage Listings", ownerArea],
                  ["Property Analytics", ownerArea],
                  ["Set Inspection Times", ownerArea],
                ]],
                ["Company",[
                  ["About Basha.app", ()=>setShowAbout(true)],
                  ["Contact", ()=>{window.location.href="mailto:monjur111@gmail.com";}],
                  ["Privacy Policy", ()=>{window.open("/privacy.html","_blank");}],
                ]],
                ["Guides",[
                  ["How to Rent in Dhaka", ()=>{window.open("/blog/rent-flat-dhaka-guide","_blank");}],
                  ["Bachelor Flat Rent Guide", ()=>{window.open("/blog/bachelor-flat-rent-dhaka","_blank");}],
                  ["Buying Land Safely", ()=>{window.open("/blog/buying-land-house-bangladesh","_blank");}],
                  ["All Guides →", ()=>{window.open("/blog/","_blank");}],
                ]],
              ];
              return cols.map(([title,items])=>(
                <div key={title} style={{flex:"1 1 110px"}}>
                  <div style={{color:"#fff",fontWeight:700,marginBottom:9,fontSize:13}}>{title}</div>
                  {items.map(([item,action])=><div key={item} onClick={action} style={{fontSize:11.5,marginBottom:6,cursor:"pointer",color:"#4d7a5f"}}
                    onMouseEnter={e=>e.target.style.color="#fff"}
                    onMouseLeave={e=>e.target.style.color="#4d7a5f"}>{item}</div>)}
                </div>
              ));
            })()}
          </div>
          <div style={{borderTop:"1px solid #1a2e22",paddingTop:14,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:9,fontSize:11,color:"#2d5040"}}>
            <span>© 2026 Basha.app · All rights reserved.</span>
            <span>🇧🇩 Built for Bangladesh · Dhaka HQ</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <DetailModal p={selected} onClose={()=>setSelected(null)} L={L} lang={lang}/>
      {showWizard&&<ListWizard onClose={()=>{setShowWizard(false);setEditingProp(null);}} onAddArea={handleAddArea} onAddProperty={handleAddProperty} editingProp={editingProp} onEditProperty={handleEditProperty} customAreas={customAreas}/>}
      {showAuth&&<AuthModal onClose={()=>setShowAuth(false)} onLogin={handleLogin} initialMode={authMode}/>}
      {showOwnerDash&&user&&<OwnerDashboard user={user} onClose={()=>setShowOwnerDash(false)} onLogout={()=>{handleLogout();}} onSwitchToTenant={switchToTenant} onListProperty={()=>{setShowOwnerDash(false);setShowWizard(true);}} savedProps={savedIds} userProps={userProps} onDeleteProperty={handleDeleteProperty} onEditProperty={(p)=>{setEditingProp(p);setShowOwnerDash(false);setShowWizard(true);}} lang={lang} L={L}/>}
      {showTenantDash&&user&&<TenantDashboard user={user} onClose={()=>setShowTenantDash(false)} onLogout={()=>{handleLogout();}} onSwitchToOwner={switchToOwner} savedIds={savedIds} onUnsave={id=>setSavedIds(p=>p.filter(x=>x!==id))} searchHistory={searchHistory} lang={lang} L={L}/>}
      {showAbout&&<AboutModal onClose={()=>setShowAbout(false)} lang={lang}/>}

      {/* PWA Install Banner */}
      {showPWA && <PWABanner onInstall={installPWA} onDismiss={dismissPWA} isIOS={isIOS}/>}

      {/* MOBILE BOTTOM NAV */}
      {isMobile&&(
        <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#fff",borderTop:`1px solid ${T.border}`,display:"flex",zIndex:600,boxShadow:"0 -2px 12px rgba(0,0,0,0.1)",paddingBottom:"env(safe-area-inset-bottom)"}}>
          {[
            {icon:"🔍",label:"Search",   action:()=>window.scrollTo({top:0,behavior:"smooth"})},
            {icon:"❤️",label:"Saved",    action:()=>user?setShowTenantDash(true):(setAuthMode("signin"),setShowAuth(true))},
            {icon:"➕",label:"List",     action:()=>user?setShowWizard(true):(setAuthMode("signup"),setShowAuth(true)), highlight:true},
            {icon:"📅",label:"Bookings", action:()=>user?setShowTenantDash(true):(setAuthMode("signin"),setShowAuth(true))},
            {icon:"👤",label:user?"Me":"Sign In", action:()=>user?((user.role==="owner"||user.role==="agent")?setShowOwnerDash(true):setShowTenantDash(true)):(setAuthMode("signin"),setShowAuth(true))},
          ].map(({icon,label,action,highlight})=>(
            <button key={label} onClick={action} style={{
              flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
              gap:2,padding:"8px 4px",border:"none",cursor:"pointer",
              background:highlight?"linear-gradient(135deg,"+T.red+",#a00d24)":"#fff",
              color:highlight?"#fff":T.muted,
              borderRadius:highlight?"10px":"0",
              margin:highlight?"4px 2px":0,
            }}>
              <span style={{fontSize:highlight?22:19}}>{icon}</span>
              <span style={{fontSize:9,fontWeight:700,letterSpacing:.3}}>{label}</span>
            </button>
          ))}
        </div>
      )}
      {isMobile&&<div style={{height:70}}/>}
    </div>
  );
}
