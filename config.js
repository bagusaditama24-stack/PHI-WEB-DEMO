export const mqttConfig = {
    host: "broker.emqx.io",
    port: 8084,
    useSSL: true,
    path: "/mqtt",
    username: "",
    password: "",
    topicBase: "iot/produksi_baru" 
};

export const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "counter-iot-phi.firebaseapp.com",
    databaseURL: "https://counter-iot-phi-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "counter-iot-phi",
    appId: "YOUR_FIREBASE_APP_ID"
};
