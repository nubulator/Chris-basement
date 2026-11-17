// Card presentation only. Rank comparisons, dealing, scoring and storage live in casino.html.
window.CasinoCardArt = (() => {
  const suitNames={'♠':'spades','♥':'hearts','♦':'diamonds','♣':'clubs'};
  const rankNames={A:'Ace',K:'King',Q:'Queen',J:'Jack'};
  const pairs=ys=>ys.flatMap(y=>[[28,y],[72,y]]);
  const pips={2:[[50,18],[50,82]],3:[[50,18],[50,50],[50,82]],4:pairs([18,82]),5:[...pairs([18,82]),[50,50]],6:pairs([18,50,82]),7:[...pairs([18,50,82]),[50,34]],8:[...pairs([18,50,82]),[50,34],[50,66]],9:[...pairs([14,38,62,86]),[50,50]],10:[...pairs([14,38,62,86]),[50,26],[50,74]]};
  function name(c){return (rankNames[c.label]||c.label)+' of '+suitNames[c.suit];}
  function face(c,back=false){
    if(back)return '';
    const corner='<span class="card-corner"><b>'+c.label+'</b><span>'+c.suit+'</span></span>';
    const court={J:'jack',Q:'queen',K:'king'}[c.label];
    const center=court?'<img class="court-art" src="./assets/kings-premium/'+court+'-v1.webp" alt="">':c.label==='A'?'<span class="ace-pip">'+c.suit+'</span>':'<span class="card-pips">'+(pips[c.rank]||[]).map(([x,y])=>'<span class="pip'+(y>50?' inverted':'')+'" style="left:'+x+'%;top:'+y+'%">'+c.suit+'</span>').join('')+'</span>';
    return '<span class="card-design" aria-hidden="true">'+corner+center+corner+'</span>';
  }
  return {name,face};
})();
