import { StreamingHttp } from '@capacitor/streaming-http';

window.testEcho = () => {
    const inputValue = document.getElementById("echoInput").value;
    StreamingHttp.echo({ value: inputValue })
}
