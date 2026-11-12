(function(root){
 'use strict';
 const groups=['family','travel','signposts','albums','ohio-sports','seasonal'];
 function selection(settings={}){
  if(settings.collection==='mixed'||!settings.collection)return [...groups];
  if(Array.isArray(settings.selectedGroups))return groups.filter(group=>settings.selectedGroups.includes(group));
  // Old Travel & signposts and Sports & album covers presets keep both groups.
  if(settings.collection==='travel')return ['travel','signposts'];
  if(settings.collection==='sports')return ['ohio-sports','albums'];
  return groups.includes(settings.collection)?[settings.collection]:[...groups];
 }
 const api={groups,selection,includes:(item,settings)=>selection(settings).includes(item.type)};
 if(typeof module!=='undefined')module.exports=api;else root.StudioCollections=api;
})(typeof window!=='undefined'?window:globalThis);
