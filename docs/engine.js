/* A transparent, local stochastic model; all generated statistics are fictional. */
function simulate(f,config,random=Math.random){
 const rand=(a,b)=>a+random()*(b-a),int=(a,b)=>Math.floor(rand(a,b+1));
 const strong=f.strength?Number(f.strength):/マドリード|シティ|アスレティック/.test(f.opponent)?1.25:/ビジャレアル|ベティス|ソシエダ|ヴィラ/.test(f.opponent)?1.08:.82;
 const minutes=Number(config.minutes),boost=Number(config.flair),style=config.style;
 const roster=config.roster||ROSTER;
 const teamName=config.teamName||'バルセロナ';
 const substitute=roster.find(p=>p.number===9).name;
 const starters=[1,23,5,24,3,16,8,21,19,10,11];
 const players=starters.filter(n=>n!==10||minutes>0).map(n=>{const p=roster.find(x=>x.number===n);return {...p,minutes:n===10?minutes:90,goals:0,assists:0,duels:0,passMade:0,passTotal:0,tackles:0,blocks:0,clearances:0,distance:0,sprints:0};});
 if(minutes<90){const p=roster.find(x=>x.number===9);players.push({...p,minutes:90-minutes,goals:0,assists:0});}
 const active=t=>players.filter(p=>p.number===10?t<=minutes:p.number===9?t>minutes:true);
 const weighted=(arr,weight)=>{let total=arr.reduce((s,p)=>s+weight(p),0),v=random()*total;return arr.find(p=>(v-=weight(p))<=0)||arr.at(-1);};
 let shots=[],events=[],goal=[0,0];
 const counts=[int(15,24)+(boost===2?5:0)+(style==='attack'?3:0),int(6,13)+(strong>1.1?3:0)];
 for(let team=0;team<2;team++)for(let j=0;j<counts[team];j++){
  const minute=int(1,90),xg=rand(.025,.35)*(team===0?(1.15+.2*boost):strong),on=random()<.45;
  const scorer=team===0?weighted(active(minute),p=>p.number===10?7:p.pos.includes('W')?3:p.pos.includes('CF')?4:p.pos.includes('AM')?2:.4):null;
  const scored=on&&random()<Math.min(.92,xg*(team===0&&scorer.number===10?3.6:2.15));
  shots.push({minute,team,xg,on,scored});
  if(scored){goal[team]++;let assister=null;if(team===0){scorer.goals++;const candidates=active(minute).filter(p=>p.number!==scorer.number);if(random()<.83){assister=weighted(candidates,p=>p.number===10?7:p.pos.includes('CM')||p.pos.includes('W')?3:.7);assister.assists++;}}
   events.push({minute,team,scorer:scorer?.name||f.opponent+'のFW',assister:assister?.name||null,text:team===0?(scorer.number===10?'四葉紅夜が密集を抜け、ゴールへ流し込む。':assister?.number===10?'紅夜が中盤へ降りて引きつけ、ラストパスで得点を演出。':'パス交換から守備の隙を突いてフィニッシュ。'):`素早い攻守の切り替えから${teamName}の背後を突いて得点。`});
  }
 }
 players.forEach(p=>{const scale=p.minutes/90,def=p.pos.includes('CB')||p.pos.includes('B /'),gk=p.pos==='GK';p.duels=Math.round(int(gk?0:4,p.number===10?22:13)*scale);p.passTotal=Math.round(int(gk?20:35,p.number===10?85:95)*scale);p.passMade=Math.round(p.passTotal*rand(.77,.96));p.tackles=Math.round(int(0,def?6:3)*scale);p.blocks=Math.round(int(0,def?4:1)*scale);p.clearances=Math.round(int(0,def?7:gk?3:1)*scale);p.distance=+(rand(gk?3:9,gk?5:12.3)*scale).toFixed(2);p.sprints=Math.round(int(gk?0:12,gk?3:32)*scale);});
 const possession=Math.round(Math.min(78,Math.max(48,rand(59,70)+(f.home?3:0)-(strong-1)*14+(minutes/90)*boost+(style==='control'?4:0))));
 const teams=[0,1].map(t=>({goals:goal[t],possession:t===0?possession:100-possession,shots:shots.filter(s=>s.team===t).length,on:shots.filter(s=>s.team===t&&s.on).length,xg:+shots.filter(s=>s.team===t).reduce((v,s)=>v+s.xg,0).toFixed(2),corners:int(t===0?4:1,t===0?10:6),fk:0,offsides:int(0,5),distance:t===0?+players.reduce((s,p)=>s+p.distance,0).toFixed(2):+rand(99,116).toFixed(2),sprints:t===0?players.reduce((s,p)=>s+p.sprints,0):int(140,240)}));
 const fouls=[int(6,15),int(8,18)];teams[0].fk=fouls[1]+teams[1].offsides;teams[1].fk=fouls[0]+teams[0].offsides;
 events.sort((a,b)=>a.minute-b.minute);shots.sort((a,b)=>a.minute-b.minute);
 const k=players.find(p=>p.number===10),outcome=goal[0]>goal[1]?'勝利':goal[0]===goal[1]?'引き分け':'敗戦';
 const summary=`${teamName}は${possession}%のポゼッションで${style==='attack'?'前線へ積極的にボールを送り':style==='control'?'中盤で丁寧にボールを循環させ':'攻守のバランスを保ち'}、${teams[0].shots}本のシュートを放った。${minutes?`偽9番の四葉紅夜は${minutes}分出場し、${k.goals}得点${k.assists}アシスト。${k.goals+k.assists?'自由なポジショニングがゴールに結びついた。':'相手を引きつけて味方のスペースを作ったが、直接の得点関与には至らなかった。'}`:`紅夜は休養。${substitute}が最前線を担当した。`}相手は${teams[1].shots}本のシュートから${goal[1]}得点。${goal[0]}–${goal[1]}で${outcome}となった。`;
 return {fixtureId:f.id,createdAt:new Date().toISOString(),config:{...config},teams,players,events,shots,summary};
}
if(typeof module!=='undefined')module.exports={simulate};
