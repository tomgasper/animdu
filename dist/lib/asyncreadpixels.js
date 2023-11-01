// from
// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function clientWaitAsync(gl, sync, flags, interval_ms) {
    return new Promise((resolve, reject) => {
        function test() {
            const res = gl.clientWaitSync(sync, flags, 0);
            if (res === gl.WAIT_FAILED) {
                reject();
                return;
            }
            if (res === gl.TIMEOUT_EXPIRED) {
                setTimeout(test, interval_ms);
                return;
            }
            resolve();
        }
        test();
    });
}
function getBufferSubDataAsync(gl, target, buffer, srcByteOffset, dstBuffer, 
/* optional */ dstOffset = 0, 
/* optional */ length = 0) {
    return __awaiter(this, void 0, void 0, function* () {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        yield clientWaitAsync(gl, sync, 0, 10);
        gl.deleteSync(sync);
        gl.bindBuffer(target, buffer);
        gl.getBufferSubData(target, srcByteOffset, dstBuffer, dstOffset, length);
        gl.bindBuffer(target, null);
        return dstBuffer;
    });
}
export function readPixelsAsync(gl, x, y, w, h, format, type, dest) {
    return __awaiter(this, void 0, void 0, function* () {
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, buf);
        gl.bufferData(gl.PIXEL_PACK_BUFFER, dest.byteLength, gl.STREAM_READ);
        gl.readPixels(x, y, w, h, format, type, 0);
        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
        yield getBufferSubDataAsync(gl, gl.PIXEL_PACK_BUFFER, buf, 0, dest);
        gl.deleteBuffer(buf);
        return dest;
    });
}
//# sourceMappingURL=asyncreadpixels.js.map