import init, * as wasm from '../../';

<script type="module">
    init().then((_exports) => {
      console.log(wasm)

      let tesseract = new wasm.Tesseract()
      tesseract.load_from_storage()
      console.log(`loaded data`)

      const passphrase = new Uint8Array([1,2,3,4,5,6,7,8,9,0]);
      //self.crypto.getRandomValues(passphrase);
      console.log(`passphrase: ${passphrase}`);
      tesseract.unlock(passphrase)
      console.log(`unlocked`)

      if (!tesseract.autosave_enabled()) {
        tesseract.set_autosave()
      }
      console.log(`enabled saving`)

      let key = `mykey`
      if (tesseract.exist(key)) {
        console.log(`${key} exists: ${tesseract.retrieve(key)}`)
      } else {
        console.log(`${key} does not exist yet`)
      }

      tesseract.set(key, `value123`)
      console.log(`set ${key}: ${tesseract.retrieve(key)}`)
      tesseract.set(key, `persisted123`)
      console.log(`set ${key}: ${tesseract.retrieve(key)}`)

      tesseract.save()
      console.log(`saved: ${key}`)

      let stream = {}
      stream[Symbol.asyncIterator] = () => { return tesseract.subscribe() }
      console.log(`subscribed to stream`)

      async function stream_reader() {
        for await (const value of stream) {
          console.log(wasm.TesseractEvent[await value])
        }
      };
      stream_reader()
      console.log(`started stream reader loop`)

      async function tesseract_lock_loop() {
        for (let i = 0; i < 10; i++) {
          await new Promise(resolve => setTimeout(resolve, 50))
          tesseract.lock()
        }
      }
      tesseract_lock_loop()
      console.log(`started tesseract lock loop`)

    });
  </script>