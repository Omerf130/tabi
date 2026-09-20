import type { PhrasebookCategory } from "./types";
import { resolvePhraseIntentMessageKey } from "./phrase-intent-message-key";
import type { PhraseIntent } from "./phrase-intent-types";

function definePhraseIntent(
  id: string,
  category: PhrasebookCategory,
  azureSourceText: string,
  searchKeywords?: readonly string[],
): PhraseIntent {
  return {
    id,
    category,
    messageKey: resolvePhraseIntentMessageKey(id),
    azureSourceText,
    searchKeywords,
  };
}

export const PHRASE_INTENTS: readonly PhraseIntent[] = [
  definePhraseIntent("basics.hello", "basics", "Hello"),
  definePhraseIntent("basics.thank-you", "basics", "Thank you"),
  definePhraseIntent("basics.thank-you-very-much", "basics", "Thank you very much"),
  definePhraseIntent("basics.excuse-me", "basics", "Excuse me / Sorry, may I?", ["excuse me","sorry"]),
  definePhraseIntent("basics.please", "basics", "Please"),
  definePhraseIntent("basics.yes", "basics", "Yes"),
  definePhraseIntent("basics.no", "basics", "No"),
  definePhraseIntent("basics.dont-understand", "basics", "I do not understand", ["do not understand","לא מבין","לא מבינה"]),
  definePhraseIntent("basics.speak-english", "basics", "Do you speak English?", ["english","אנגלית"]),
  definePhraseIntent("basics.goodbye", "basics", "Goodbye"),
  definePhraseIntent("restaurants.table-for-two", "restaurants", "A table for two, please", ["table","שולחן"]),
  definePhraseIntent("restaurants.menu-english", "restaurants", "Do you have a menu in English?", ["menu","תפריט"]),
  definePhraseIntent("restaurants.no-meat", "restaurants", "Without meat, please", ["vegetarian","no meat","צמחוני"]),
  definePhraseIntent("restaurants.allergy", "restaurants", "I am allergic to… (name the ingredient)", ["allergy","אלרגיה","אלרגי","אלרגית"]),
  definePhraseIntent("restaurants.water", "restaurants", "Water, please", ["water","מים"]),
  definePhraseIntent("restaurants.bill", "restaurants", "Can we have the bill?", ["bill","check","חשבון"]),
  definePhraseIntent("restaurants.card-payment", "restaurants", "Can I pay by card?", ["credit card","card","כרטיס"]),
  definePhraseIntent("restaurants.delicious", "restaurants", "That was very delicious", ["tasty","delicious","טעים"]),
  definePhraseIntent("transport.where-station", "transport", "Where is the station?", ["station","train","תחנה","רכבת"]),
  definePhraseIntent("transport.where-platform", "transport", "Where is the platform?", ["platform","רציף"]),
  definePhraseIntent("transport.train-to", "transport", "Does this train go to…?", ["train","רכבת"]),
  definePhraseIntent("transport.buy-ticket", "transport", "Where can I buy a ticket?", ["ticket","כרטיס"]),
  definePhraseIntent("transport.taxi-address", "transport", "Please take me to this address", ["taxi","address","מונית","כתובת"]),
  definePhraseIntent("transport.one-person", "transport", "One ticket for one adult", ["adult","one person","מבוגר"]),
  definePhraseIntent("transport.next-stop", "transport", "What is the next stop?", ["next stop"]),
  definePhraseIntent("transport.express-train", "transport", "Is this an express train?", ["express","מהיר"]),
  definePhraseIntent("hotel.reservation", "hotel", "I have a reservation", ["reservation","booking","הזמנה"]),
  definePhraseIntent("hotel.check-in", "hotel", "Check-in, please", ["check in","check-in"]),
  definePhraseIntent("hotel.luggage", "hotel", "Can I leave my luggage?", ["luggage","מזוודות"]),
  definePhraseIntent("hotel.check-out-time", "hotel", "What time is check-out?", ["checkout","check-out"]),
  definePhraseIntent("hotel.wifi", "hotel", "What is the Wi-Fi password?", ["wifi","internet","אינטרנט"]),
  definePhraseIntent("hotel.breakfast", "hotel", "Where is breakfast?", ["breakfast","בוקר"]),
  definePhraseIntent("hotel.towel", "hotel", "Can I have an extra towel?", ["towel","מגבת"]),
  definePhraseIntent("shopping.how-much", "shopping", "How much does this cost?", ["price","how much","מחיר","כמה"]),
  definePhraseIntent("shopping.other-size", "shopping", "Do you have another size?", ["size","מידה"]),
  definePhraseIntent("shopping.card", "shopping", "Can I pay by card?", ["credit card","card","כרטיס"]),
  definePhraseIntent("shopping.tax-free", "shopping", "Is tax-free shopping available?", ["tax free","פטור ממס"]),
  definePhraseIntent("shopping.just-looking", "shopping", "I am just looking", ["looking","מסתכל"]),
  definePhraseIntent("shopping.bag", "shopping", "Can I have a bag, please?", ["bag","שקית"]),
  definePhraseIntent("directions.restroom", "directions", "Where is the restroom?", ["toilet","bathroom","wc","restroom","שירותים"]),
  definePhraseIntent("directions.exit", "directions", "Where is the exit?", ["exit","יציאה"]),
  definePhraseIntent("directions.how-to-get", "directions", "How do I get to…?", ["directions","how to get","התמצאות"]),
  definePhraseIntent("directions.far-from-here", "directions", "Is it far from here?", ["far","רחוק"]),
  definePhraseIntent("directions.walk-minutes", "directions", "How many minutes on foot?", ["walk","minutes","הליכה","דקות"]),
  definePhraseIntent("directions.lost", "directions", "I am lost", ["lost","איבוד"]),
  definePhraseIntent("emergency.need-help", "emergency", "I need help", ["help","עזרה"]),
  definePhraseIntent("emergency.ambulance", "emergency", "Please call an ambulance", ["ambulance","אמבולנס"]),
  definePhraseIntent("emergency.hospital", "emergency", "Where is the nearest hospital?", ["hospital","בית חולים"]),
  definePhraseIntent("emergency.lost-passport", "emergency", "I lost my passport", ["passport","דרכון"]),
  definePhraseIntent("emergency.police", "emergency", "Please call the police", ["police","משטרה"]),
  definePhraseIntent("emergency.feel-sick", "emergency", "I do not feel well", ["sick","health","לא טוב","בריאות"]),
  definePhraseIntent("emergency.allergy-medicine", "emergency", "I have an allergy — I need medicine", ["medicine","allergy","תרופה","אלרגיה"]),
  definePhraseIntent("numbers_time.one", "numbers_time", "One", ["1"]),
  definePhraseIntent("numbers_time.two", "numbers_time", "Two", ["2"]),
  definePhraseIntent("numbers_time.ten", "numbers_time", "Ten", ["10"]),
  definePhraseIntent("numbers_time.what-time", "numbers_time", "What time is it?", ["time","שעה","זמן"]),
  definePhraseIntent("numbers_time.today", "numbers_time", "Today", ["today"]),
  definePhraseIntent("numbers_time.tomorrow", "numbers_time", "Tomorrow", ["tomorrow"]),
] as const;

export function getPhraseIntentById(id: string): PhraseIntent | undefined {
  return PHRASE_INTENTS.find((intent) => intent.id === id);
}

export function listPhraseIntentsInCatalogOrder(): readonly PhraseIntent[] {
  return PHRASE_INTENTS;
}
