import { sendMaxData, sendTotalFaceData } from "../main";

type Emotion = {
  name: string;
  score: number;
};

type AggregateScores = {
  [key: string]: { [key: string]: number };
};

var audienceMembers = 0;

var requestCount = 0;

var mostCommonData = [];

var types = ["emotions", "facs", "descriptions"];

const aggregateScores: AggregateScores = {
  emotions: {
    Admiration: 0,
    Adoration: 0,
    "Aesthetic Appreciation": 0,
    Amusement: 0,
    Anger: 0,
    Anxiety: 0,
    Awe: 0,
    Awkwardness: 0,
    Boredom: 0,
    Calmness: 0,
    Concentration: 0,
    Contemplation: 0,
    Confusion: 0,
    Contempt: 0,
    Contentment: 0,
    Craving: 0,
    Determination: 0,
    Disappointment: 0,
    Disgust: 0,
    Distress: 0,
    Doubt: 0,
    Ecstasy: 0,
    Embarrassment: 0,
    "Empathic Pain": 0,
    Entrancement: 0,
    Envy: 0,
    Excitement: 0,
    Fear: 0,
    Guilt: 0,
    Horror: 0,
    Interest: 0,
    Joy: 0,
    Love: 0,
    Nostalgia: 0,
    Pain: 0,
    Pride: 0,
    Realization: 0,
    Relief: 0,
    Romance: 0,
    Sadness: 0,
    Satisfaction: 0,
    Desire: 0,
    Shame: 0,
    "Surprise (negative)": 0,
    "Surprise (positive)": 0,
    Sympathy: 0,
    Tiredness: 0,
    Triumph: 0,
  },
  facs: {
    "AU1 Inner Brow Raise": 0,
    "AU2 Outer Brow Raise": 0,
    "AU4 Brow Lowerer": 0,
    "AU5 Upper Lid Raise": 0,
    "AU6 Cheek Raise": 0,
    "AU7 Lids Tight": 0,
    "AU9 Nose Wrinkle": 0,
    "AU10 Upper Lip Raiser": 0,
    "AU11 Nasolabial Furrow Deepener": 0,
    "AU12 Lip Corner Puller": 0,
    "AU14 Dimpler": 0,
    "AU15 Lip Corner Depressor": 0,
    "AU16 Lower Lip Depress": 0,
    "AU17 Chin Raiser": 0,
    "AU18 Lip Pucker": 0,
    "AU19 Tongue Show": 0,
    "AU20 Lip Stretch": 0,
    "AU22 Lip Funneler": 0,
    "AU23 Lip Tightener": 0,
    "AU24 Lip Presser": 0,
    "AU25 Lips Part": 0,
    "AU26 Jaw Drop": 0,
    "AU27 Mouth Stretch": 0,
    "AU28 Lips Suck": 0,
    "AU32 Bite": 0,
    "AU34 Puff": 0,
    "AU37 Lip Wipe": 0,
    "AU38 Nostril Dilate": 0,
    "AU43 Eye Closure": 0,
    "AU53 Head Up": 0,
    "AU54 Head Down": 0,
    "Hand over Mouth": 0,
    "Hand over Eyes": 0,
    "Hand over Forehead": 0,
    "Hand over Face": 0,
    "Hand touching Face / Head": 0,
  },
  descriptions: {
    Beaming: 0,
    "Biting lip": 0,
    Cheering: 0,
    Cringe: 0,
    Cry: 0,
    "Eyes closed": 0,
    "Face in hands": 0,
    Frown: 0,
    Gasp: 0,
    Glare: 0,
    Glaring: 0,
    Grimace: 0,
    Grin: 0,
    "Jaw drop": 0,
    Laugh: 0,
    "Licking lip": 0,
    Pout: 0,
    Scowl: 0,
    Smile: 0,
    Smirk: 0,
    Snarl: 0,
    Squint: 0,
    Sulking: 0,
    "Tongue out": 0,
    "Wide-eyed": 0,
    Wince: 0,
    "Wrinkled nose": 0,
  },
};
function storeMostCommon() {
  var update_map: any = {};
  sendTotalFaceData(aggregateScores);
  types.forEach((type) => {
    var max_val = -1;
    var best_res = "";
    Object.keys(aggregateScores[type]).forEach((val) => {
      if (max_val < aggregateScores[type][val]) {
        max_val = aggregateScores[type][val];
        best_res = val;
      }
    });
    update_map[type] = best_res;
    Object.keys(aggregateScores[type]).forEach((val) => {
      aggregateScores[type][val] = 0;
    });
  });
  mostCommonData.push(update_map);
  sendMaxData(update_map);
}

function calculateAggregate(apiInput: string) {
    const data = JSON.parse(apiInput)["data"];
    audienceMembers =JSON.parse(apiInput)["members"] ; 

    try{
        types.forEach(type => {
            if (data["face"]["predictions"]) {
                const emotions = data["face"]["predictions"][0][type];
    
                emotions.forEach((emotion: { name: string; score: number; }) => {
                    let { name, score } = emotion;
    
                    if (name in aggregateScores[type]) {
                        if (score < 0.2) score = 0;
                        aggregateScores[type][name] += score;
                    }
                });
            }
    
        });
    }
    catch(err){
        console.log(err); 
        return; 
    }

    // console.log(aggregateScores); 
   

    // storeMostCommon(); 

    requestCount++;
    if (requestCount % audienceMembers == 0) {
        
        storeMostCommon();
    }
  });

  // storeMostCommon();

  requestCount++;
  if (requestCount % audienceMembers == 0) {
    storeMostCommon();
  }
}

export { calculateAggregate };
