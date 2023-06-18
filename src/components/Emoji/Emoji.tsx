type AppProps = {
  name: string;
};

const emojiName: any = {
  Admiration: "nerd-face_1f913",
  Adoration: "thinking-face_1f914",
  "Aesthetic Appreciation": "smiling-face-with-halo_1f607",
  Amusement: "love-you-gesture_1f91f",
  Anger: "angry-face_1f620",
  Anxiety: "fearful-face_1f628",
  Awe: "red-heart_2764-fe0f",
  Awkwardness: "smiling-face-with-smiling-eyes_1f60a",
  Boredom: "tired-face_1f62b",
  Calmness: "smiling-face-with-halo_1f607",
  Concentration: "books_1f4da",
  Contemplation: "smiling-face-with-smiling-eyes_1f60a.",
  Confusion: "confused-face_1f615",
  Contempt: "man-pouting_1f64e-200d-2642-fe0f",
  Contentment: "smiling-face-with-smiling-eyes_1f60a.",
  Craving: "tired-face_1f62b",
  Determination: "face-with-tears-of-joy_1f602",
  Disappointment: "disguised-face_1f978",
  Disgust: "disguised-face_1f978",
  Distress: "fearful-face_1f628",
  Doubt: "tired-face_1f62b",
  Ecstasy: "smiling-face-with-halo_1f607",
  Embarrassment: "fearful-face_1f628",
  "Empathic Pain": "smiling-face-with-smiling-eyes_1f60a",
  Entrancement: "smiling-face-with-halo_1f607",
  Envy: "man-pouting_1f64e-200d-2642-fe0f",
  Excitement: "face-with-tears-of-joy_1f602",
  Fear: "skull_1f480",
  Guilt: "man-pouting_1f64e-200d-2642-fe0f",
  Horror: "skull_1f480",
  Interest: "smiling-face-with-halo_1f607",
  Joy: "face-with-tears-of-joy_1f602",
  Love: "red-heart_2764-fe0f",
  Nostalgia: "smiling-face-with-halo_1f607",
  Pain: "anxious-face-with-sweat_1f630",
  Pride: "smiling-face_263a-fe0f",
  Realization: "smiling-face_263a-fe0f",
  Relief: "smiling-face_263a-fe0f",
  Romance: "red-heart_2764-fe0f",
  Sadness: "sad-but-relieved-face_1f625",
  Satisfaction: "thumbs-up_1f44d",
  Desire: "",
  Shame: "unamused-face_1f612",
  "Surprise (negative)": "",
  "Surprise (positive)": "smiling-face_263a-fe0f",
  Sympathy: "",
  Tiredness: "sad-but-relieved-face_1f625",
  Triumph: "",
  "Biting lip": "",
  Cheering: "smiling-face_263a-fe0f",
  Cringe: "unamused-face_1f612",
  Cry: "crying-face_1f622",
  "Eyes closed": "",
  "Face in hands": "",
  Frown: "sad-but-relieved-face_1f625",
  Gasp: "",
  Glare: "",
  Glaring: "",
  Grimace: "tired-face_1f62b",
  Grin: "unamused-face_1f612",
  "Jaw drop": "",
  Laugh: "rolling-on-the-floor-laughing_1f923",
  "Licking lip": "",
  Pout: "man-pouting_1f64e-200d-2642-fe0f",
  Scowl: "sad-but-relieved-face_1f625",
  Smile: "smiling-face_263a-fe0f",
  Smirk: "",
  Snarl: "",
  Squint: "",
  Sulking: "man-pouting_1f64e-200d-2642-fe0f",
  "Tongue out": "face-with-tongue_1f61b",
  "Wide-eyed": "",
  Wince: "man-pouting_1f64e-200d-2642-fe0f",
  "Wrinkled nose": "",
};

// https://github.com/dherault/react-apple-emojis/blob/master/src/data.json
const Emoji = ({ name }: AppProps) => {
  return (
    <img
      src={`https://em-content.zobj.net/thumbs/240/apple/354/${
        name ? emojiName[name] : "smiling-face_263a-fe0f"
      }.png`}
      alt=" "
      aria-label={name}
      style={{ width: 48, height: 48 }}
    />
  );
};

export default Emoji;
