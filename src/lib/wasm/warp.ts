import init, * as wasm from '../../../warp-wasm/pkg/warp_ipfs'

export class CWarpInstance {
    private warp_instance!: wasm.WarpInstance
    public multipass!: wasm.MultiPassBox
    public raygun!: wasm.RayGunBox
    public constellation!: wasm.ConstellationBox

    async initWarp(tesseract: wasm.Tesseract): Promise<void> {
        await init()
        this.warp_instance = await new wasm.WarpIpfs(wasm.Config.minimal_testing(), tesseract) as wasm.WarpInstance
        this.multipass = this.warp_instance.multipass
        this.constellation = this.warp_instance.constellation
        this.raygun = this.warp_instance.raygun
        console.log('WarpInstance: ', this.warp_instance)
        console.log('Multipass: ', this.multipass)
        console.log('Constellation: ', this.constellation)
        console.log('RayGun: ', this.raygun)
    }

    getMultipass(): wasm.MultiPassBox {
        if (!this.multipass) {
            throw new Error("Multipass is not initialized")
        }
        return this.multipass
    }

    getRaygun(): wasm.RayGunBox {
        if (!this.raygun) {
            throw new Error("Raygun is not initialized")
        }
        return this.raygun
    }

    getConstellation(): wasm.ConstellationBox {
        if (!this.constellation) {
            throw new Error("Constellation is not initialized")
        }
        return this.constellation
    }
}

export const WarpInstance = new CWarpInstance()
