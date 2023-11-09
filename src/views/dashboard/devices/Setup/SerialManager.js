import { ESPLoader, Transport } from "esptool-js";
import md5 from "crypto-js/md5";
import latin1 from "crypto-js/enc-latin1";

export default class SerialManager {
  constructor(cleanFn, writeLineFn, writeFn, progressReport) {
    this.progressReport = progressReport;
    this.log = {
      clean() {
        cleanFn();
      },
      writeLine(data) {
        writeLineFn(data);
      },
      write(data) {
        writeFn(data);
      },
    };
  }

  async connect() {
    this.log.writeLine("Running ESP Stub procedure...");
    try {
      if (this.device === undefined) {
        this.device = await navigator.serial.requestPort({});
        this.transport = new Transport(this.device);
      } else {
        this.log.writeLine("Disconnecting previous serial...");
        await this.lastReader.cancel();
        await this.transport.disconnect();
        this.log.writeLine("Disconnected pevious serial");
      }
    } catch (e) {
      this.log.writeLine("Failed connect to ESP - " + e);
    }
  }

  async loadStub() {

    this.log.writeLine("Constructing ESPLoader...");

    const flashOptions = {
      transport: this.transport,
      baudrate: 921600,
      terminal: this.log,
    };

    this.espLoader = new ESPLoader(flashOptions);
    this.log.writeLine("Constructed ESPLoader, now running stub..-");
    this.chip = await this.espLoader.main_fn();
    this.log.writeLine("Stub started");

    this.log.writeLine("Connected to ESP");
  }

  async erase() {
    try {
      const stamp = Date.now();
      await espLoader.erase_flash();
      this.log.writeLine("Erased flash, took " + (Date.now() - stamp) + "ms");
    } catch (e) {
      this.log.writeLine("Failed to erase flash. " + e);
    }
  }

  async flash(data) {
    console.log(data);
    this.log.writeLine("Flashing... please wait...");
    let stamp = Date.now();

    const flashOptions = {
      fileArray: [{ data: data, address: 0 }],
      flashSize: "keep",
      eraseAll: false,
      compress: true,
      reportProgress: (fileIndex, written, total) => {
        this.progressReport(fileIndex, written, total);
      },
      calculateMD5Hash: (image) => md5(latin1.parse(image)),
    };

    await this.espLoader.write_flash(flashOptions);
    this.log.writeLine(
      "Finished flashing, took " + (Date.now() - stamp) + "ms"
    );
  }

  async disconnect() {
    this.log.writeLine("Disconnecting...");
    if (this.transport !== undefined) await this.transport.disconnect();
    this.log.writeLine("Disconnected!");
  }

  async stopConsole() {
    this.consoleRunning = false;
    console.log("closed");
    await this.transport.waitForUnlock(400);
  }

  async startConsole() {
    if (this.device === undefined) {
      this.device = await navigator.serial.requestPort({});
      this.transport = new Transport(this.device);
      await this.transport.connect();
    }

    if (this.espLoader !== undefined) {
      this.espLoader.baudrate = 115200;
      await this.espLoader.change_baud();
    }

    this.readConsoleLoop();
  }

  async readConsoleLoop() {
    this.consoleRunning = true;

    try {
      while (this.consoleRunning) {
        const val = await this.rawRead();
        console.log(val);
        if (typeof val === "undefined") {
          this.log.writeLine("Console read loop stopping");
          break;
        }
        this.log.write(val);
      }
    } catch (e) {}
  }

  async rawRead(timeout = 0) {
    if (this.transport.left_over.length != 0) {
      const p = this.transport.left_over;
      this.transport.left_over = new Uint8Array(0);
      return p;
    }
    if (!this.transport.device.readable) {
      return this.transport.left_over;
    }

    const reader = this.transport.device.readable.getReader();
    this.lastReader = reader;
    let t;
    try {
      if (timeout > 0) {
        t = setTimeout(async () => {
          await reader.cancel();
        }, timeout);
      }
      const { value, done } = await reader.read();
      console.log(value, done);
      if (done) {
        throw new Error("Timeout");
      }
      return value;
    } finally {
      if (timeout > 0) {
        clearTimeout(t);
      }
      reader.releaseLock();
    }
  }
}
