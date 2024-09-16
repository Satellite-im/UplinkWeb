import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
    appId: "com.uplink.app",
    appName: "Uplink",
    webDir: "build",
    bundledWebRuntime: false,
    server: {
        // TODO(Mobile): Replace <your-machine-ip> with your machine's IP address
        url: "http://<your-machine-ip>:5173",
        cleartext: true,
    },
}

export default config
