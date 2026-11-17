/* Read-only adventure deck: no score, player, storage or cloud writes. */
(function(){
'use strict';
const trips=[
  {
    "id": 0,
    "title": "Rock legends & dinner",
    "city": "Cleveland",
    "setting": "Indoor",
    "seasons": [
      "Any time"
    ],
    "plan": "Explore the Rock & Roll Hall of Fame, then each couple picks a song for the drive to dinner.",
    "url": "https://rockhall.com/visit/"
  },
  {
    "id": 1,
    "title": "Art critics for a day",
    "city": "Cleveland",
    "setting": "Indoor",
    "seasons": [
      "Any time"
    ],
    "plan": "Visit the Cleveland Museum of Art. Each person chooses a favorite artwork, then compare picks over dinner.",
    "url": "https://www.clevelandart.org/plan-your-visit"
  },
  {
    "id": 2,
    "title": "Cleared for takeoff",
    "city": "Dayton area",
    "setting": "Indoor",
    "seasons": [
      "Any time"
    ],
    "plan": "Explore the National Museum of the U.S. Air Force together, then stop for a relaxed meal. Choose a few galleries to keep the day manageable.",
    "url": "https://www.nationalmuseum.af.mil/Visit/Directions.aspx"
  },
  {
    "id": 3,
    "title": "Glass, gardens & a good meal",
    "city": "Columbus",
    "setting": "Indoor",
    "seasons": [
      "Any time"
    ],
    "plan": "Explore the conservatory displays at Franklin Park, then let the losing euchre team pick dessert.",
    "url": "https://www.experiencecolumbus.com/things-to-do/attractions/"
  },
  {
    "id": 4,
    "title": "German Village wander",
    "city": "Columbus",
    "setting": "Both",
    "seasons": [
      "Spring",
      "Summer",
      "Fall"
    ],
    "plan": "Browse German Village shops, take a neighborhood stroll, and settle in for a long lunch. Give each couple a small souvenir challenge.",
    "url": "https://www.experiencecolumbus.com/things-to-do/attractions/"
  },
  {
    "id": 5,
    "title": "A canopy adventure",
    "city": "Kirtland",
    "setting": "Outdoor",
    "seasons": [
      "Spring",
      "Summer",
      "Fall"
    ],
    "plan": "Explore Holden Arboretum’s gardens and trails. Add the canopy walk or tower if open and everyone feels up for it.",
    "url": "https://www.holdenarb.org/hours-and-information/"
  },
  {
    "id": 6,
    "title": "Hocking Hills escape",
    "city": "Logan area",
    "setting": "Outdoor",
    "seasons": [
      "Spring",
      "Summer",
      "Fall"
    ],
    "plan": "Choose a scenic Hocking Hills outing that suits the whole group, then make dinner and a cabin euchre rematch the evening plan.",
    "url": "https://www.explorehockinghills.com/"
  },
  {
    "id": 7,
    "title": "Rainy-day treasure hunt",
    "city": "Hocking Hills area",
    "setting": "Indoor",
    "seasons": [
      "Any time"
    ],
    "plan": "Pick an indoor attraction from the local visitor guide, browse for an unusual souvenir, and finish with a cozy meal.",
    "url": "https://www.explorehockinghills.com/things-to-do/indoor-recreation/?view=all"
  },
  {
    "id": 8,
    "title": "Island time for four",
    "city": "Put-in-Bay",
    "setting": "Outdoor",
    "seasons": [
      "Summer"
    ],
    "plan": "Plan a ferry day on South Bass Island with sightseeing, a leisurely lunch, and time by the water. Confirm ferry service before setting out.",
    "url": "https://www.visitputinbay.org/"
  },
  {
    "id": 9,
    "title": "Lake Erie summer day",
    "city": "Geneva-on-the-Lake",
    "setting": "Outdoor",
    "seasons": [
      "Summer"
    ],
    "plan": "Use the village adventure guide to choose a few summer stops, share a casual meal, and enjoy the lakeside atmosphere.",
    "url": "https://visitgenevaonthelake.com/visitors-guide/"
  },
  {
    "id": 10,
    "title": "Wine-country weekend",
    "city": "Geneva-on-the-Lake",
    "setting": "Both",
    "seasons": [
      "Any time"
    ],
    "plan": "Make a lodge stay and a winery shuttle outing the centerpiece of a couples’ weekend. Reserve transport and finish with dinner together.",
    "url": "https://ohiodnr.gov/go-and-do/plan-a-visit/find-a-property/the-lodge-at-genevaonthelake"
  },
  {
    "id": 11,
    "title": "Winter lodge retreat",
    "city": "Geneva-on-the-Lake",
    "setting": "Indoor",
    "seasons": [
      "Winter"
    ],
    "plan": "Book a cozy lodge getaway with an indoor meal and plenty of time for cards. Keep the lake views as the backdrop to a slow weekend.",
    "url": "https://ohiodnr.gov/go-and-do/plan-a-visit/find-a-property/the-lodge-at-genevaonthelake"
  },
  {
    "id": 12,
    "title": "A couples’ escape close to home",
    "city": "Gahanna",
    "setting": "Both",
    "seasons": [
      "Any time"
    ],
    "plan": "Choose an activity from Gahanna’s couples’ itinerary, then add dinner. Make it a mini-adventure without an overnight stay.",
    "url": "https://www.visitgahanna.com/Visit/Itineraries/Couples-Escape/"
  }
];
const setting=document.getElementById('tripSetting'),season=document.getElementById('tripSeason'),card=document.getElementById('tripCard');
let remaining=[],last=-1;
function matches(t){return (setting.value==='Any setting'||t.setting===setting.value)&&(season.value==='Any season'||t.seasons.includes(season.value)||t.seasons.includes('Any time'));}
function draw(reset){
 const pool=trips.filter(matches);
 if(reset)remaining=[];
 card.replaceChildren();
 if(!pool.length){card.textContent='No cards match those filters. Try another season or setting.';return;}
 if(!remaining.length)remaining=pool.map(t=>t.id).sort(()=>Math.random()-.5);
 let index=remaining.findIndex(id=>id!==last);if(index<0)index=0;
 const id=remaining.splice(index,1)[0],t=trips.find(t=>t.id===id);last=id;
 const city=document.createElement('p');city.className='trip-city';city.textContent=t.city+' · OHIO';
 const title=document.createElement('h3');title.textContent=t.title;
 const tags=document.createElement('p');tags.className='trip-tags';tags.textContent=t.setting+' · '+t.seasons.join(' / ');
 const plan=document.createElement('p');plan.textContent=t.plan;
 const link=document.createElement('a');link.href=t.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Open official planning guide ↗';
 const count=document.createElement('small');count.textContent=pool.length+' matching adventures · '+remaining.length+' left before reshuffling';
 card.append(city,title,tags,plan,link,count);
 document.getElementById('drawTrip').textContent='Draw Another Adventure';
}
setting.addEventListener('change',()=>draw(true));season.addEventListener('change',()=>draw(true));
document.getElementById('drawTrip').addEventListener('click',()=>draw(false));draw(true);
})();

