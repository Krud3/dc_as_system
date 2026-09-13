/** Cámara scripted: no mezclar con OrbitControls damping/autorotate. */

export function createScriptedCamera(stage) {
  function lockScriptedCam(ctl) {
    stage._scriptedCamera = true;
    const wasDamp = ctl.enableDamping;
    ctl.autoRotate = false;
    ctl.enabled = false;
    ctl.enableDamping = false;
    ctl.update(); // vacía sphericalDelta / panOffset residuales del autorotate
    return wasDamp;
  }
  function unlockScriptedCam(ctl, { wasDamp, wasAuto, cam, near0, p0, t0 } = {}) {
    if (p0 && cam) cam.position.copy(p0);
    if (t0) ctl.target.copy(t0);
    if (cam && near0 != null) { cam.near = near0; cam.updateProjectionMatrix(); }
    if (cam && t0) cam.lookAt(ctl.target);
    ctl.enableDamping = wasDamp !== false;
    stage._scriptedCamera = false;
    ctl.enabled = true;
    ctl.autoRotate = !!wasAuto;
    ctl.update();
  }
  function aimScriptedCam(cam, ctl, pos, target) {
    cam.position.copy(pos);
    ctl.target.copy(target);
    cam.lookAt(ctl.target);
  }
  return { lockScriptedCam, unlockScriptedCam, aimScriptedCam };
}
