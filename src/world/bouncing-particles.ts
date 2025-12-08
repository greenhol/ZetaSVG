import { ModuleConfig } from '../config/module-config';
import { ONE_DEGREE } from '../types/constants';
import { Circle3d } from '../types/shape/circle';
import { Rectangle3d, RectangleStyle } from '../types/shape/rectangle';
import { createOrigin, SpaceCoord } from '../types/space-coord';
import { World, WorldConfig } from './world';

interface Particle {
    position: SpaceCoord;
    velocity: SpaceCoord;
    staticX: boolean;
    staticY: boolean;
    staticZ: boolean;
    outOfBounds: boolean;
}

const BOX_WIDTH = 6;
const BOX_WIDTH_HALF = BOX_WIDTH / 2;
const BOX_HEIGHT = 4;
const BOX_HEIGHT_HALF = BOX_HEIGHT / 2;

export class BouncingParticles extends World {

    private _rectangleStyleBottom: RectangleStyle = {
        strokeWidth: .75,
        stroke: '#88f',
        strokeOpacity: .5,
        fill: 'none',
        fillOpacity: 0,
    };

    private _rectangleStyleSides1: RectangleStyle = {
        strokeWidth: .25,
        stroke: '#999',
        strokeOpacity: .5,
        fill: 'none',
        fillOpacity: 0,
    };

    private _rectangleStyleSides2: RectangleStyle = {
        strokeWidth: .25,
        stroke: '#999',
        strokeOpacity: .5,
        fill: 'none',
        fillOpacity: 0,
    };

    private static ACCELERATION = 0.0095;
    private particles: Particle[];

    constructor() {
        super();

        this.rectangles = [
            new Rectangle3d(createOrigin(), BOX_WIDTH, BOX_WIDTH, { rotateX: 90, rotateY: 0, rotateZ: 0 }, this._rectangleStyleBottom),
            new Rectangle3d({ x: BOX_WIDTH_HALF, y: BOX_HEIGHT_HALF, z: 0 }, BOX_WIDTH, BOX_HEIGHT, { rotateX: 0, rotateY: 90, rotateZ: 0 }, this._rectangleStyleSides1),
            new Rectangle3d({ x: 0, y: BOX_HEIGHT_HALF, z: BOX_WIDTH_HALF }, BOX_HEIGHT, BOX_WIDTH, { rotateX: 0, rotateY: 0, rotateZ: 90 }, this._rectangleStyleSides1),
            new Rectangle3d({ x: -BOX_WIDTH_HALF, y: BOX_HEIGHT_HALF, z: 0 }, BOX_WIDTH, BOX_HEIGHT, { rotateX: 0, rotateY: 90, rotateZ: 0 }, this._rectangleStyleSides2),
            new Rectangle3d({ x: 0, y: BOX_HEIGHT_HALF, z: -BOX_WIDTH_HALF }, BOX_HEIGHT, BOX_WIDTH, { rotateX: 0, rotateY: 0, rotateZ: 90 }, this._rectangleStyleSides2),
        ];

        this.particles = [];
        for (let i = 0; i < 1500; i++) {
            let angle = 2 * Math.PI * Math.random();
            let horizontalVelocity = 0.1 * Math.random();
            this.particles.push({
                position: { x: 0, y: 0.01, z: 0 },
                velocity: {
                    x: horizontalVelocity * Math.sin(angle),
                    y: Math.random() * 0.35,
                    z: horizontalVelocity * Math.cos(angle),
                },
                staticX: false,
                staticY: false,
                staticZ: false,
                outOfBounds: false,
            });
        }
        this.updateCirclesFromParticles();
        this.init();
    };

    override config = new ModuleConfig<WorldConfig>(
        {
            cameraPerspective: {
                position: { x: 0, y: 2, z: -7.3 },
                angleX: 15 * ONE_DEGREE,
                angleY: 40 * ONE_DEGREE,
                angleZ: 0,
            },
        },
        "bouncingParticlesConfig",
    );

    public name: string = "Bouncing Particles";

    public transitionToStateAt(t: number): void {
        this.particles.forEach((particle: Particle) => {

            if (particle.staticX && particle.staticY && particle.staticZ) return;

            // Y -> Vertical (Gravity)
            if (particle.position.y <= 0 && particle.velocity.y < 0) { // Bpuncing on bottom (decreasing all velocities)
                particle.velocity.x *= 0.8;
                particle.velocity.y *= -0.8;
                particle.velocity.z *= 0.8;
            } else {
                particle.velocity.y -= BouncingParticles.ACCELERATION;
            }
            // X, Z Horizontal (Bounce in Box)
            if (!particle.outOfBounds) {
                if (Math.abs(particle.position.x) >= BOX_WIDTH_HALF - 0.1) {
                    if (particle.position.y > BOX_HEIGHT) {
                        particle.outOfBounds = true;
                    } else {
                        particle.velocity.x *= -1;
                    }
                }
                if (Math.abs(particle.position.z) >= BOX_WIDTH_HALF - 0.1) {
                    if (particle.position.y > BOX_HEIGHT) {
                        particle.outOfBounds = true;
                    } else {
                        particle.velocity.z *= -1;
                    }
                }
            }

            // Update Position
            if (Math.abs(particle.velocity.x) < 0.001) particle.staticX = true;
            if (Math.abs(particle.velocity.y) < 0.001 && Math.abs(particle.position.y) < 0.001) particle.staticY = true;
            if (Math.abs(particle.velocity.z) < 0.001) particle.staticZ = true;

            if (!particle.staticX) particle.position.x += particle.velocity.x;
            if (!particle.staticX) particle.position.y += particle.velocity.y;
            if (!particle.staticX) particle.position.z += particle.velocity.z;
        });
        this.updateCirclesFromParticles();
    }

    private updateCirclesFromParticles(): void {
        this.circles = this.particles.map((particle: Particle): Circle3d => { return new Circle3d(particle.position, 1.5) });
    }
}