const DEFAULT_MU = 1150;
const DEFAULT_BODY_RADIUS = 46;

function round(value, precision = 4) {
  const scale = 10 ** precision;
  return Math.round(value * scale) / scale;
}

function magnitude(vector) {
  return Math.hypot(vector.x, vector.y);
}

function normalize(vector) {
  const length = magnitude(vector);
  if (length === 0) return { x: 0, y: 0 };
  return { x: vector.x / length, y: vector.y / length };
}

function perpendicular(vector) {
  return { x: -vector.y, y: vector.x };
}

function cloneState(state) {
  return {
    position: { ...state.position },
    velocity: { ...state.velocity },
    mu: state.mu,
    bodyRadius: state.bodyRadius,
    elapsed: state.elapsed || 0,
    status: state.status || "coasting",
  };
}

function accelerationAt(position, mu = DEFAULT_MU) {
  const radius = Math.max(1, magnitude(position));
  const factor = -mu / radius ** 3;
  return {
    x: position.x * factor,
    y: position.y * factor,
  };
}

function createOrbitState(options = {}) {
  const mu = options.mu || DEFAULT_MU;
  const radius = options.radius || 138;
  const circularSpeed = Math.sqrt(mu / radius);

  return {
    position: {
      x: options.x ?? radius,
      y: options.y ?? 0,
    },
    velocity: {
      x: options.vx ?? 0,
      y: options.vy ?? round(circularSpeed, 5),
    },
    mu,
    bodyRadius: options.bodyRadius || DEFAULT_BODY_RADIUS,
    elapsed: options.elapsed || 0,
    status: options.status || "stable",
  };
}

function stepOrbit(state, deltaTime = 0.08) {
  const next = cloneState(state);
  if (next.status === "impact") return next;

  const acceleration = accelerationAt(next.position, next.mu);
  next.velocity = {
    x: next.velocity.x + acceleration.x * deltaTime,
    y: next.velocity.y + acceleration.y * deltaTime,
  };
  next.position = {
    x: next.position.x + next.velocity.x * deltaTime,
    y: next.position.y + next.velocity.y * deltaTime,
  };
  next.elapsed = round((next.elapsed || 0) + deltaTime, 3);

  const altitude = magnitude(next.position) - next.bodyRadius;
  next.status = altitude <= 0 ? "impact" : classifyOrbit(next);
  return next;
}

function classifyOrbit(state) {
  const telemetry = getOrbitTelemetry(state);
  if (telemetry.altitude < 12) return "skimming";
  if (telemetry.eccentricity < 0.16) return "stable";
  if (telemetry.energy >= 0) return "escape";
  return "elliptical";
}

function applyImpulse(state, direction, magnitudeDelta = 0.42) {
  const next = cloneState(state);
  const radial = normalize(next.position);
  const prograde = normalize(next.velocity);
  const retrograde = { x: -prograde.x, y: -prograde.y };

  const vectors = {
    prograde,
    retrograde,
    radialOut: radial,
    radialIn: { x: -radial.x, y: -radial.y },
    normal: normalize(perpendicular(radial)),
  };
  const burn = vectors[direction] || prograde;

  next.velocity = {
    x: next.velocity.x + burn.x * magnitudeDelta,
    y: next.velocity.y + burn.y * magnitudeDelta,
  };
  next.status = `${direction || "prograde"} burn`;
  return next;
}

function getOrbitTelemetry(state) {
  const radius = magnitude(state.position);
  const speed = magnitude(state.velocity);
  const energy = speed ** 2 / 2 - state.mu / radius;
  const angularMomentum = Math.abs(state.position.x * state.velocity.y - state.position.y * state.velocity.x);
  const eccentricity = Math.sqrt(Math.max(0, 1 + (2 * energy * angularMomentum ** 2) / state.mu ** 2));
  const semiMajorAxis = energy < 0 ? -state.mu / (2 * energy) : Infinity;
  const period = Number.isFinite(semiMajorAxis)
    ? 2 * Math.PI * Math.sqrt(semiMajorAxis ** 3 / state.mu)
    : Infinity;

  return {
    altitude: round(radius - state.bodyRadius, 1),
    radius: round(radius, 1),
    speed: round(speed, 2),
    gravity: round(magnitude(accelerationAt(state.position, state.mu)), 3),
    energy: round(energy, 2),
    eccentricity: round(eccentricity, 2),
    period: Number.isFinite(period) ? round(period, 1) : Infinity,
    status: state.status || classifyOrbit(state),
  };
}

function projectOrbitPath(state, steps = 180, deltaTime = 0.1) {
  const path = [];
  let projected = cloneState(state);

  for (let index = 0; index < steps; index += 1) {
    projected = stepOrbit(projected, deltaTime);
    path.push({ x: round(projected.position.x, 2), y: round(projected.position.y, 2) });
    if (projected.status === "impact") break;
  }

  return path;
}

export {
  accelerationAt,
  applyImpulse,
  createOrbitState,
  getOrbitTelemetry,
  projectOrbitPath,
  stepOrbit,
};
