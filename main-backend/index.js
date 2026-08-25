import { WebSocketServer } from "ws";
import si from "systeminformation";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  let timerId;

  // Client
  ws.on("message", async (event) => {
    try {
      const { op } = JSON.parse(event);

      if (op === 100 && !timerId) {
        // Static information

        const cpuInfo = await si.cpu();
        const graphicsInfo = await si.graphics();

        const cpuName = `${cpuInfo.manufacturer} ${cpuInfo.brand}`;

        timerId = setInterval(async () => {
          try {
            // Real-time information

            const load = await si.currentLoad();
            const mem = await si.mem();
            const cpuSpeed = await si.cpuCurrentSpeed();
            const cpuTemp = await si.cpuTemperature();

            const systemData = {
              // CPU
              cpuName: cpuName,
              cpuManufacturer: cpuInfo.manufacturer,
              cpuUsage: load.currentLoad.toFixed(2),
              cpuSpeedAvg: cpuSpeed.avg,
              cpuSpeedCores: cpuSpeed.cores,
              cpuTempMain: cpuTemp.main,
              cpuTempCores: cpuTemp.cores,
              cpuCoresUsage: load.cpus.map((c) => c.load.toFixed(2)),

              // RAM
              ramTotal: (mem.total / 1024 ** 3).toFixed(2),
              ramUsage: (mem.used / 1024 ** 3).toFixed(2),
              ramUsagePercent: ((mem.used / mem.total) * 100).toFixed(2),

              // GPU
              gpu: graphicsInfo.controllers.map((gpu) => ({
                model: gpu.model,
                vendor: gpu.vendor,
                vram: gpu.vram,
                vramDynamic: gpu.vramDynamic,
                temperatureGpu: gpu.temperatureGpu,
                utilizationGpu: gpu.utilizationGpu,
                utilizationMemory: gpu.utilizationMemory,
                clockCore: gpu.clockCore,
                clockMemory: gpu.clockMemory,
              })),
            };

            // Check connection status before sending
            if (ws.readyState === ws.OPEN) {
              ws.send(
                JSON.stringify({
                  op: 101,
                  data: systemData,
                }),
              );
            }
          } catch (err) {
            // Show Error
            console.error("Error fetching system info:", err);
          }
        }, 2000);
      }
    } catch (err) {
      console.error("Error parsing message:", err);
    }
  });

  ws.on("close", () => {
    if (timerId) {
      clearInterval(timerId);
    }
  });
});

console.log("WebSocket server is running on ws://localhost:8080");
