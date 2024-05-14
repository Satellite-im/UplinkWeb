import init, * as wasm from '../../../warp-wasm/pkg/warp_ipfs'


export class CWarpInstance {
    private warp_instance!: wasm.WarpInstance
    public multipass!: wasm.MultiPassBox
    public raygun!: wasm.RayGunBox
    public constellation!: wasm.ConstellationBox

    getMultipass(): wasm.MultiPassBox {
        return this.multipass
    }

    init(tesseract: wasm.Tesseract)  {
        init().then(async (_exports) => {
            this.warp_instance = await new wasm.WarpIpfs(wasm.Config.minimal_testing(), tesseract) as wasm.WarpInstance
            this.multipass = this.warp_instance.multipass
            this.constellation = this.warp_instance.constellation
            this.raygun = this.warp_instance.raygun
        })

    }
}

export const WarpInstance = new CWarpInstance()
