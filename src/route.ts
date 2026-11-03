/* ORTE & TAGE */
const LOC = {
  "Incheon International Airport":{"lat":37.4602,"lng":126.4407,"t":"airport"},
  "DK Airport Hotel":{"lat":37.4605,"lng":126.44,"t":"hotel"},
  "Incheon Bridge":{"lat":37.412,"lng":126.563,"t":"viewpoint"},
  "Songdo Central Park":{"lat":37.39,"lng":126.635,"t":"park"},
  "Songdo Hanok Village":{"lat":37.395,"lng":126.64,"t":"culture"},
  "G-Tower Observatory":{"lat":37.4025,"lng":126.655,"t":"viewpoint"},
  "Incheon Chinatown":{"lat":37.475,"lng":126.62,"t":"culture"},
  "Songwol-dong Fairy Tale Village":{"lat":37.476,"lng":126.627,"t":"culture"},
  "Somerset Palace Seoul":{"lat":37.57,"lng":126.98,"t":"hotel"},
  "Jogyesa Temple":{"lat":37.5719,"lng":126.9818,"t":"temple"},
  "Insa-dong":{"lat":37.5745,"lng":126.985,"t":"culture"},
  "Cheonggyecheon Stream":{"lat":37.569,"lng":126.978,"t":"park"},
  "Myeong-dong Shopping District":{"lat":37.5635,"lng":126.985,"t":"shopping"},
  "Namdaemun Market":{"lat":37.56,"lng":126.977,"t":"market"},
  "Gwanghwamun Gate":{"lat":37.5758,"lng":126.9768,"t":"palace"},
  "Gyeongbokgung Palace":{"lat":37.5796,"lng":126.977,"t":"palace"},
  "National Folk Museum of Korea":{"lat":37.5785,"lng":126.979,"t":"museum"},
  "Seoul City Wall Naksan section":{"lat":37.588,"lng":127.006,"t":"hike"},
  "Dongdaemun Design Plaza":{"lat":37.5665,"lng":127.009,"t":"culture"},
  "Namsangol Hanok Village":{"lat":37.559,"lng":126.993,"t":"culture"},
  "N Seoul Tower":{"lat":37.5512,"lng":126.9882,"t":"viewpoint"},
  "Good Morning Residence Hue":{"lat":36.35,"lng":127.385,"t":"hotel"},
  "Daejeon Station":{"lat":36.332,"lng":127.435,"t":"station"},
  "Best Louis Hamilton Hotel Haeundae":{"lat":35.163,"lng":129.163,"t":"hotel"},
  "Haeundae Beach":{"lat":35.158,"lng":129.16,"t":"beach"},
  "Club D Oasis Spa":{"lat":35.16,"lng":129.165,"t":"spa"},
  "Songdo Marine Cable Car":{"lat":35.076,"lng":129.023,"t":"transport"},
  "Songdo Sky Park Busan":{"lat":35.075,"lng":129.02,"t":"park"},
  "Hotel Trad Hakata":{"lat":33.59,"lng":130.42,"t":"hotel"},
  "Canal City Hakata":{"lat":33.59,"lng":130.41,"t":"shopping"},
  "Tocho-ji Temple":{"lat":33.593,"lng":130.415,"t":"temple"},
  "Tenjin Underground Shopping Center":{"lat":33.59,"lng":130.4,"t":"shopping"},
  "Fukuoka Castle Ruins":{"lat":33.585,"lng":130.385,"t":"castle"},
  "Fukuoka Science Museum":{"lat":33.59,"lng":130.38,"t":"museum"},
  "Fukuoka Tower":{"lat":33.593,"lng":130.351,"t":"viewpoint"},
  "Hakata Station":{"lat":33.59,"lng":130.42,"t":"station"},
  "Hiroshima Station":{"lat":34.397,"lng":132.475,"t":"station"},
  "Hiroshima Castle":{"lat":34.402,"lng":132.459,"t":"castle"},
  "Atomic Bomb Dome":{"lat":34.3955,"lng":132.4537,"t":"memorial"},
  "Hiroshima Peace Memorial Park":{"lat":34.392,"lng":132.452,"t":"memorial"},
  "Hiroshima National Peace Memorial Hall":{"lat":34.395,"lng":132.455,"t":"memorial"},
  "Fukuyama Station":{"lat":34.489,"lng":133.362,"t":"station"},
  "Fukuyama Castle":{"lat":34.491,"lng":133.361,"t":"castle"},
  "Holiday Inn Osaka Namba by IHG":{"lat":34.666,"lng":135.502,"t":"hotel"},
  "Dotonbori":{"lat":34.668,"lng":135.501,"t":"culture"},
  "Hozenji Yokocho":{"lat":34.6685,"lng":135.5015,"t":"culture"},
  "Grenier Patisserie Kitahama":{"lat":34.69,"lng":135.51,"t":"food"},
  "Osaka Castle":{"lat":34.6873,"lng":135.5259,"t":"castle"},
  "Umeda Sky Building":{"lat":34.705,"lng":135.49,"t":"viewpoint"},
  "Toei Kyoto Studio Park":{"lat":35.022,"lng":135.76,"t":"park"},
  "Arashiyama Bamboo Forest":{"lat":35.017,"lng":135.671,"t":"nature"},
  "Kyoto Botanical Gardens":{"lat":35.015,"lng":135.765,"t":"park"},
  "Kamigamo Shrine":{"lat":35.06,"lng":135.77,"t":"temple"},
  "Onyado Nono Nara Natural Hot Spring":{"lat":34.685,"lng":135.83,"t":"hotel"},
  "Sheraton Grande Tokyo Bay Hotel":{"lat":35.627,"lng":139.885,"t":"hotel"},
  "teamLab Planets TOKYO":{"lat":35.649,"lng":139.789,"t":"museum"},
  "Toyosu Senkyaku Banrai":{"lat":35.655,"lng":139.785,"t":"culture"},
  "Bulguksa Temple":{"lat":35.79,"lng":129.332,"t":"temple"},
  "RX-93ff Nu Gundam LaLaport Fukuoka":{"lat":33.595,"lng":130.425,"t":"culture"},
  "Shin-Osaka Station":{"lat":34.7335,"lng":135.5002,"t":"station"},
  "Nara Station":{"lat":34.6809,"lng":135.8189,"t":"station"},
  "Tokyo Station":{"lat":35.6812,"lng":139.7671,"t":"station"}
};

export const DAYS = [
  {"id":"d17","num":"Tag 1","date":"17.08.2026","city":"Incheon","title":"Ankunft & Check-in","hotel":"DK Airport Hotel","kr":true,"jp":false,"stops":["Incheon International Airport","DK Airport Hotel"],"modes":["car"],"trans":["","Hotel-Shuttle / Taxi / AREX"],"det":["Ankunft ca. 17:00 Uhr. Einreise, Gepäck und Abendessen am Flughafen.","Check-in und Erholung nach der Anreise."],"tim":["","~20 Min."]},
  {"id":"d18","num":"Tag 2","date":"18.08.2026","city":"Songdo → Seoul","title":"Songdo, Incheon & Seoul Zentrum","hotel":"Somerset Palace Seoul","kr":true,"jp":false,"stops":["DK Airport Hotel","Incheon Bridge","Songdo Central Park","Songdo Hanok Village","G-Tower Observatory","Incheon Chinatown","Songwol-dong Fairy Tale Village","Somerset Palace Seoul","Jogyesa Temple","Insa-dong","Cheonggyecheon Stream","Myeong-dong Shopping District","Namdaemun Market"],"modes":["car","car","walk","walk","metro","walk","metro","walk","walk","walk","metro","walk"],"trans":["","Taxi/Auto zum Incheon Bridge","Auto (~25 km)","Fußweg (~0,8 km)","Fußweg (~1,0 km)","Transit (~30 km)","Fußweg (~0,5 km)","Transit (~35 km)","Fußweg (~1,1 km)","Fußweg (~0,5 km)","Fußweg (~0,8 km)","Transit (~1,8 km)","Fußweg (~1,0 km)"],"det":["Start am Flughafenhotel.","Fahrt über die Incheon Bridge.","Park und Wasserwege in Songdo.","Traditionelle Architektur in Songdo.","Aussicht über Songdo.","Historisches Viertel von Incheon.","Buntes Märchenviertel.","Check-in im Somerset Palace Seoul.","Buddhistischer Tempel im Zentrum.","Traditionelles Einkaufs- und Kulturviertel.","Stadtbach im Zentrum Seouls.","Shopping- und Street-Food-Viertel.","Traditioneller Markt."],"tim":["","~15–20 Min.","25–35 Min.","~10 Min.","12–15 Min.","45–60 Min.","6–8 Min.","60–90 Min.","~15 Min.","~7 Min.","~10 Min.","15–25 Min.","12–15 Min."]},
  {"id":"d19","num":"Tag 3","date":"19.08.2026","city":"Seoul","title":"Paläste, Naksan, Dongdaemun & Namsan","hotel":"Somerset Palace Seoul","kr":true,"jp":false,"stops":["Somerset Palace Seoul","Gwanghwamun Gate","Gyeongbokgung Palace","National Folk Museum of Korea","Seoul City Wall Naksan section","Dongdaemun Design Plaza","Namsangol Hanok Village","N Seoul Tower"],"modes":["walk","walk","walk","metro","walk","metro","metro"],"trans":["","Fußweg (~1,3 km)","Fußweg (~0,4 km)","Fußweg (~0,3 km)","Transit (~5 km)","Fußweg (~2,5 km)","Transit (~2,5 km)","Transit (~3 km)"],"det":["Start am Hotel.","Haupttor des Gyeongbokgung-Palastes.","Königspalast der Joseon-Dynastie.","Volkskundemuseum auf dem Palastgelände.","Abschnitt der historischen Stadtmauer.","Design- und Architekturzentrum.","Traditionelles Hanok-Dorf.","Aussicht über Seoul."],"tim":["","~18 Min.","~5 Min.","~4 Min.","30–40 Min.","35–45 Min.","20–30 Min.","20–30 Min."]},
  {"id":"d23","num":"Tag 4","date":"23.08.2026","city":"Gyeongju → Busan","title":"Bulguksa & Haeundae","hotel":"Best Louis Hamilton Hotel Haeundae","kr":true,"jp":false,"stops":["Good Morning Residence Hue","Daejeon Station","Bulguksa Temple","Best Louis Hamilton Hotel Haeundae","Haeundae Beach","Club D Oasis Spa"],"modes":["metro","train","train","walk","walk"],"trans":["","Transit zum Bahnhof","Transit (~230 km)","Transit (~120 km)","Fußweg (~0,5 km)","Fußweg (~1 km)"],"det":["Start am Daejeon-Hotel.","Abfahrt Richtung Gyeongju.","UNESCO-Tempel Bulguksa.","Ankunft und Check-in in Haeundae, Busan.","Strandspaziergang.","Spa und Wellness in Haeundae."],"tim":["","~10–15 Min.","2,5–3 Std.","2–2,5 Std.","~6 Min.","12–15 Min."]},
  {"id":"d24","num":"Tag 5","date":"24.08.2026","city":"Busan","title":"Songdo / Crystal Cruise","hotel":"Best Louis Hamilton Hotel Haeundae","kr":true,"jp":false,"stops":["Best Louis Hamilton Hotel Haeundae","Songdo Marine Cable Car","Songdo Sky Park Busan","Best Louis Hamilton Hotel Haeundae"],"modes":["metro","walk","metro"],"trans":["","Transit (~20 km)","Fußweg (~0,5 km)","Transit (~20 km)"],"det":["Start in Haeundae.","Songdo Marine Cable Car – Crystal Cruise / Crystal Cabin, Round Trip Ticket.","Songdo Sky Park.","Rückfahrt nach Haeundae."],"tim":["","60–90 Min.","~7 Min.","60–90 Min."]},
  {"id":"d26","num":"Tag 6","date":"26.08.2026","city":"Fukuoka","title":"Hakata, Tenjin & Fukuoka Tower","hotel":"Hotel Trad Hakata","kr":false,"jp":true,"stops":["Hotel Trad Hakata","Canal City Hakata","Tocho-ji Temple","Tenjin Underground Shopping Center","Fukuoka Castle Ruins","Fukuoka Science Museum","Fukuoka Tower"],"modes":["walk","walk","metro","metro","walk","metro"],"trans":["","Fußweg (~1,2 km)","Fußweg (~0,8 km)","Transit (~2 km)","Transit (~3 km)","Fußweg (~1,2 km)","Transit (~5 km)"],"det":["Start am Hotel.","Großes Shopping- und Entertainment-Center.","Buddhistischer Tempel.","Unterirdisches Einkaufszentrum.","Ruinen der Burg Fukuoka.","Wissenschaftsmuseum.","Aussichtsturm."],"tim":["","~15 Min.","~10 Min.","20–25 Min.","~20 Min.","~15 Min.","25–35 Min."]},
  {"id":"d27","num":"Tag 7","date":"27.08.2026","city":"Fukuoka → Hiroshima → Fukuyama → Osaka","title":"Gundam, Hiroshima, Fukuyama & Osaka","hotel":"Holiday Inn Osaka Namba by IHG","kr":false,"jp":true,"stops":["Hotel Trad Hakata","RX-93ff Nu Gundam LaLaport Fukuoka","Hakata Station","Hiroshima Station","Hiroshima Castle","Atomic Bomb Dome","Hiroshima Peace Memorial Park","Hiroshima National Peace Memorial Hall","Hiroshima Station","Fukuyama Station","Fukuyama Castle","Fukuyama Station","Shin-Osaka Station","Dotonbori","Hozenji Yokocho"],"modes":["metro","metro","shinkansen","metro","walk","walk","walk","metro","shinkansen","walk","walk","shinkansen","metro","walk"],"trans":["","Transit (~5 km)","Transit (~5 km)","Shinkansen (~280 km)","Transit (~2 km)","Fußweg (~2 km)","Fußweg (~0,5 km)","Fußweg (~0,5 km)","Transit zurück","Shinkansen/Transit (~100 km)","Fußweg (~0,2 km)","Fußweg zurück","Shinkansen (~220 km)","Transit (~7 km)","Fußweg (~0,3 km)"],"det":["Start am Hotel.","RX-93ff Nu Gundam bei LaLaport Fukuoka.","Abfahrt mit Shinkansen.","Ankunft Hiroshima.","Burg Hiroshima.","Atomic Bomb Dome.","Peace Memorial Park.","National Peace Memorial Hall.","Rückkehr zum Bahnhof.","Weiterfahrt nach Fukuyama.","Kurzer Besuch der Burg direkt am Bahnhof.","Zurück zum Bahnhof.","Ankunft Shin-Osaka.","Abend in Dotonbori.","Hozenji Yokocho."],"tim":["","20–30 Min.","20–30 Min.","~1 Std.","20–25 Min.","~25 Min.","~6 Min.","~6 Min.","~20 Min.","25–30 Min.","~3 Min.","~3 Min.","1–1,5 Std.","25–35 Min.","~4 Min."]},
  {"id":"d28","num":"Tag 8","date":"28.08.2026","city":"Osaka","title":"Kitahama, Osaka Castle & Umeda Sky","hotel":"Holiday Inn Osaka Namba by IHG","kr":false,"jp":true,"stops":["Holiday Inn Osaka Namba by IHG","Grenier Patisserie Kitahama","Osaka Castle","Umeda Sky Building"],"modes":["metro","metro","metro"],"trans":["","Transit (~4 km)","Transit (~3 km)","Transit (~6 km)"],"det":["Start am Hotel.","Grenier Patisserie Kitahama.","Osaka Castle.","Umeda Sky Building / Floating Garden Observatory."],"tim":["","20–30 Min.","20–30 Min.","30–40 Min."]},
  {"id":"d29","num":"Tag 9","date":"29.08.2026","city":"Osaka → Arashiyama → Kyoto → Osaka","title":"Arashiyama, Toei, Botanischer Garten & Kamigamo","hotel":"Holiday Inn Osaka Namba by IHG","kr":false,"jp":true,"stops":["Holiday Inn Osaka Namba by IHG","Arashiyama Bamboo Forest","Toei Kyoto Studio Park","Kyoto Botanical Gardens","Kamigamo Shrine","Holiday Inn Osaka Namba by IHG"],"modes":["train","train","train","bus","train"],"trans":["","Transit (~50 km)","Transit (~4 km)","Transit (~12 km)","Transit (~2 km)","Transit (~55 km)"],"det":["Start am Hotel in Osaka.","Arashiyama Bamboo Forest.","Toei Kyoto Studio Park.","Kyoto Botanical Gardens.","Kamigamo Shrine.","Rückkehr zum Hotel in Osaka."],"tim":["","75–90 Min.","20–30 Min.","40–50 Min.","15–25 Min.","75–90 Min."]},
  {"id":"d31","num":"Tag 10","date":"31.08.2026","city":"Nara → Tokyo / Toyosu","title":"Transfer nach Tokyo & teamLab Planets","hotel":"Sheraton Grande Tokyo Bay Hotel","kr":false,"jp":true,"stops":["Onyado Nono Nara Natural Hot Spring","Nara Station","Tokyo Station","Sheraton Grande Tokyo Bay Hotel","teamLab Planets TOKYO","Toyosu Senkyaku Banrai"],"modes":["walk","shinkansen","train","train","walk"],"trans":["","Fußweg zum Bahnhof","Transit/Shinkansen (~500 km)","Transit (~25 km)","Transit (~25 km)","Fußweg (~1 km)"],"det":["Start am Hotel in Nara.","Abfahrt von Nara Station.","Ankunft Tokyo Station.","Check-in im Sheraton Grande Tokyo Bay.","Immersives Kunstmuseum.","Toyosu Senkyaku Banrai."],"tim":["","~5 Min.","3,5–4 Std.","45–60 Min.","45–60 Min.","12–15 Min."]}
];

const MODE_COLORS = {walk:'#27ae60',metro:'#2980b9',train:'#8e44ad',car:'#e74c3c',bus:'#f39c12',shinkansen:'#e84393',plane:'#00cec9',ferry:'#00b894',cablecar:'#9b59b6',monorail:'#6c5ce7',shuttle:'#636e72',tram:'#00b894'};

/* KARTE */
const map = L.map('map',{zoomControl:false}).setView([36.5,128.5],6);
L.control.zoom({position:'bottomright'}).addTo(map);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
  attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom:19
}).addTo(map);

let layers=[],markers=[];
function clearMap(){layers.forEach(l=>map.removeLayer(l));markers.forEach(m=>map.removeLayer(m));layers=[];markers=[];}

function getIcon(type,num,visited){
  const colors={hotel:'#d35400',airport:'#e74c3c',station:'#8e44ad',temple:'#27ae60',palace:'#f39c12',museum:'#2980b9',park:'#27ae60',beach:'#3498db',shopping:'#e84393',viewpoint:'#9b59b6',culture:'#16a085',food:'#e67e22',nature:'#2ecc71',memorial:'#7f8c8d',castle:'#c0392b',amusement:'#ff6b6b',spa:'#00cec9',activity:'#fdcb6e',transport:'#6c5ce7',fortress:'#636e72',hike:'#00b894',street:'#d63031',nightlife:'#2d3436',market:'#e17055'};
  const c=visited?'#27ae60':(colors[type]||'#2c7873');
  const check=visited?'✓':'';
  return L.divIcon({className:'custom-marker',html:`<div style="width:28px;height:28px;background:${c};border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:bold;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">${num}${check}</div>`,iconSize:[28,28],iconAnchor:[14,14]});
}

function haversine(a,b){
  const R=6371,dLat=(b.lat-a.lat)*Math.PI/180,dLng=(b.lng-a.lng)*Math.PI/180;
  const h=Math.sin(dLat/2)**2+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h))*10)/10;
}

function buildKakaoLink(stopName,lat,lng){
  return `https://map.kakao.com/link/to/${encodeURIComponent(stopName)},${lat},${lng}`;
}
function buildGoogleLinkTo(stopName,lat,lng){
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=transit`;
}
function buildGoogleLink(stops){
  const coords=stops.map(s=>LOC[s]?`${LOC[s].lat},${LOC[s].lng}`:null).filter(Boolean);
  if(coords.length<2)return'#';
  let url=`https://www.google.com/maps/dir/?api=1&origin=${coords[0]}&destination=${coords[coords.length-1]}&travelmode=transit`;
  if(coords.length>2)url+=`&waypoints=${coords.slice(1,-1).join('|')}`;
  return url;
}

function flyTo(lat,lng,z){map.flyTo([lat,lng],z,{duration:1.2});}

/* RENDER TAGE */
function renderDay(id){
  currentDayId = id;
  clearMap();
  if(id==='costs'){
    document.querySelectorAll('.day-btn').forEach(b=>b.classList.toggle('active',b.dataset.id==='costs'));
    document.querySelectorAll('.day-content').forEach(p=>p.classList.toggle('active',p.dataset.id==='costs'));
    renderCostApp();
    map.setView([35.68,139.76],5);
    return;
  }
  const day=DAYS.find(d=>d.id===id); if(!day)return;
  document.querySelectorAll('.day-btn').forEach(b=>b.classList.toggle('active',b.dataset.id===id));
  document.querySelectorAll('.day-content').forEach(p=>p.classList.toggle('active',p.dataset.id===id));
  const bounds=[];
  day.stops.forEach((stop,i)=>{
    const loc=LOC[stop]; if(!loc)return;
    bounds.push([loc.lat,loc.lng]);
    const isHotel=loc.t==='hotel';
    const num=isHotel?'H':(i+1);
    const visited=isVisited(stop);
    const marker=L.marker([loc.lat,loc.lng],{icon:getIcon(loc.t,num,visited),keyboard:false}).addTo(map)
      .bindPopup(`<b>${stop}</b>${visited?' ✅':''}<br><span style="font-size:0.8rem;color:#666">${loc.t.toUpperCase()}</span><br><span style="font-size:0.75rem">${day.det[i]||''}</span>`);
    markers.push(marker);
  });
  for(let i=0;i<day.stops.length-1;i++){
    const a=LOC[day.stops[i]],b=LOC[day.stops[i+1]];
    if(!a||!b)continue;
    const mode=day.modes[i]||'walk';
    const col=MODE_COLORS[mode]||'#999';
    const line=L.polyline([[a.lat,a.lng],[b.lat,b.lng]],{color:col,weight:4,opacity:0.85,dashArray:mode==='walk'?'8,6':null}).addTo(map);
    layers.push(line);
  }
  if(bounds.length)map.fitBounds(bounds,{padding:[60,60],maxZoom:14});
}

/*    INIT UI */
const timeline=document.getElementById('timeline');
const sidebar=document.getElementById('sidebar');

DAYS.forEach((day,idx)=>{
  const btn=document.createElement('button');
  btn.type='button';
  btn.className='day-btn'+(idx===0?' active':'');
  btn.dataset.id=day.id;
  btn.innerHTML=`<span class="d-num">${day.num}</span><span class="d-date">${day.date}</span><span class="d-city">${day.city}</span>`;
  btn.onclick=()=>{renderDay(day.id);const el=document.querySelector(`.day-content[data-id="${day.id}"]`);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});};
  timeline.appendChild(btn);
});

const costBtn=document.createElement('button');
costBtn.type='button';
costBtn.className='day-btn cost-tab-btn';
costBtn.dataset.id='costs';
costBtn.innerHTML='<span class="d-num">💰</span><span class="d-date">Kosten</span><span class="d-city">Abrechnung</span>';
costBtn.onclick=()=>{renderDay('costs');};
timeline.appendChild(costBtn);

DAYS.forEach((day,idx)=>{
  const panel=document.createElement('article');
  panel.className='day-content'+(idx===0?' active':'');
  panel.dataset.id=day.id;
  let badges='';
  if(day.hotel&&day.hotel!=='-')badges+=`<span class="badge badge-hotel">🏨 ${day.hotel}</span>`;
  let routeHTML=''; let totalDist=0;
  day.stops.forEach((stop,i)=>{
    const loc=LOC[stop]; const isHotel=loc&&loc.t==='hotel';
    const num=isHotel?'H':(i+1);
    const mode=day.modes[i-1];
    const tClass=mode?'t-'+mode:'';
    const tLabel=mode?({walk:'Fußweg',metro:'U-Bahn',train:'Zug',car:'Auto/Taxi',bus:'Bus',shinkansen:'Shinkansen',plane:'Flug',ferry:'Fähre',cablecar:'Seilbahn',monorail:'Einschienenbahn',shuttle:'Shuttle',tram:'Straßenbahn'})[mode]:'';
    let distStr='';
    if(i>0&&loc&&LOC[day.stops[i-1]]){const d=haversine(LOC[day.stops[i-1]],loc);totalDist+=d;distStr=`~${d} km`;}
    const visited=isVisited(stop);
    const vCheck=visited?'✅ ':'';
    const vBtn=isAdmin()?`<button class="btn" style="padding:4px 10px;font-size:0.72rem;margin-top:6px;border:none;${visited?'background:#27ae60;':'background:var(--primary);'}color:#fff;display:inline-flex;align-items:center;gap:4px;" onclick="toggleVisited('${esc(stop)}')">${visited?'✅':'⬜'} Zaliczone</button>`:'';
    let navBtn='';
    if(loc && !isHotel){
      if(day.kr){
        navBtn=`<a class="btn btn-maps-kr" style="padding:4px 10px;font-size:0.7rem;margin-top:6px;margin-left:4px;" href="${buildKakaoLink(stop,loc.lat,loc.lng)}" target="_blank">🗺 Kakao Maps</a>`;
      } else if(day.jp){
        navBtn=`<a class="btn btn-maps-jp" style="padding:4px 10px;font-size:0.7rem;margin-top:6px;margin-left:4px;" href="${buildGoogleLinkTo(stop,loc.lat,loc.lng)}" target="_blank">🗺 Google Maps</a>`;
      }
    }
    routeHTML+=`<div class="route-item"><div class="route-connector"></div><div class="route-num ${isHotel?'hotel':''} ${visited?'visited':''}">${num}</div><div class="route-body"><div class="route-name">${vCheck}${stop}</div><div class="route-desc">${day.det[i]||''} ${distStr?'<b>• '+distStr+'</b>':''}</div>${day.trans[i]?`<span class="transport-tag ${tClass}">${tLabel?tLabel+': ':''}${day.trans[i]}</span>`:''}${day.tim[i]?`<div class="route-time">⏱ ${day.tim[i]}</div>`:''}<div style="display:flex;flex-wrap:wrap;gap:4px;">${vBtn}${navBtn}</div></div></div>`;
  });
  const routeMapBtn=day.jp?`<a class="btn btn-maps-jp" href="${buildGoogleLink(day.stops)}" target="_blank">🗺 In Google Maps öffnen</a>`:'';
  panel.innerHTML=`<div class="day-header"><h2>${day.title}</h2><div class="day-sub">${day.city}</div><div class="day-date">${day.date} • ${day.num}</div></div><div class="badges">${badges}</div><div class="sec-divider">📍 Route & Sehenswürdigkeiten</div><div class="route-list">${routeHTML}</div><div class="dist-summary"><strong>📏 Gesamtstrecke (Luftlinie):</strong> ~${Math.round(totalDist*10)/10} km<br><span style="font-size:0.75rem;color:var(--muted)">Tatsächliche Route kann abweichen.</span></div><div class="actions">${routeMapBtn}<button class="btn btn-center" onclick="renderDay('${day.id}')">🎯 Karte zentrieren</button></div>`;
  sidebar.appendChild(panel);
});

const costPanel=document.createElement('article');
costPanel.className='day-content cost-panel';
costPanel.dataset.id='costs';
costPanel.innerHTML=`<div id="cost-app"></div>`;
sidebar.appendChild(costPanel);

renderDay('d17');

Object.assign(window, { flyTo, renderDay });