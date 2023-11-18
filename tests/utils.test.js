import { afterEach, describe, expect, it, vi } from "vitest";

// Import setUniforms function
import { setUniforms } from "../src/utils";

// Define a mock programInfo object
const programInfo = {
  uniforms: {
    transform: { location: 'transform_location', type: 'm3fv' },
    colour: { location: 'colour_location', type: '4fv' },
    res: { location: 'res_location', type: '2fv' },
  },
};

// Create mock WebGL context and functions
const gl = {
  uniform4fv: vi.fn(),
  uniform2fv: vi.fn(),
  uniformMatrix3fv: vi.fn(),
};

// Clear gl mock functions after each test
afterEach( () => {
  for (let fnc in gl)
  {
    gl[fnc].mockClear();
  }
});

// Test cases
describe('setUniforms function', () => {
  it('should set uniform values correctly', () => {
    const properties = {
      transform: [1,0,0,0,1,0,0,0,1],
      colour: [0.0,0.0,0.0,1.0],
      res: [800,600],
    };

    setUniforms(gl, programInfo, properties);

    // Verify that the uniform values were set correctly
    expect(gl.uniformMatrix3fv).toHaveBeenCalledWith("transform_location", false, [1,0,0,0,1,0,0,0,1]);
    expect(gl.uniform4fv).toHaveBeenCalledWith("colour_location", [0.0,0.0,0.0,1.0]);
    expect(gl.uniform2fv).toHaveBeenCalledWith("res_location", [800,600]);
    console.log(gl.uniform2fv.mock.calls.length);
  });

  it('shouldnt try to assign value to shader that doesnt exist', () => {
    const properties = {
      u_unknown_uniform: [1.0, 2.0, 3.0,4.0],
    };

    setUniforms(gl, programInfo, properties);

    // Verify that an unrecognized type message was logged
    expect(gl.uniform4fv).not.toHaveBeenCalled();
  });

  it('should not set values for missing properties', () => {
    const properties = {
      transform: [1,0,0,0,1,0,0,0,1]
      // Missing u_vec2_uniform and u_float_uniform
    };

    setUniforms(gl, programInfo, properties);

    // Verify that the missing uniform values were not set
    expect(gl.uniformMatrix3fv).toHaveBeenCalledWith("transform_location", false, [1,0,0,0,1,0,0,0,1]);
    expect(gl.uniform4fv).not.toHaveBeenCalled();
    expect(gl.uniform2fv).not.toHaveBeenCalled();
  });
});