class GeometryCalculator {
    static midpoint(A, B) {
        return {
            x: (A.x + B.x) / 2,
            y: (A.y + B.y) / 2,
            z: (A.z + B.z) / 2
        };
    }

    static centroid(A, B, C) {
        return {
            x: (A.x + B.x + C.x) / 3,
            y: (A.y + B.y + C.y) / 3,
            z: (A.z + B.z + C.z) / 3
        };
    }

    static vectorFromPoints(A, B) {
        return {
            x: B.x - A.x,
            y: B.y - A.y,
            z: B.z - A.z
        };
    }

    static dotProduct(u, v) {
        return u.x * v.x + u.y * v.y + u.z * v.z;
    }

    static crossProduct(u, v) {
        return {
            x: u.y * v.z - u.z * v.y,
            y: u.z * v.x - u.x * v.z,
            z: u.x * v.y - u.y * v.x
        };
    }

    static vectorLength(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }

    static normalizeVector(v) {
        const len = this.vectorLength(v);
        if (len === 0) return { x: 0, y: 0, z: 0 };
        return {
            x: v.x / len,
            y: v.y / len,
            z: v.z / len
        };
    }

    static distanceBetweenPoints(A, B) {
        const dx = B.x - A.x;
        const dy = B.y - A.y;
        const dz = B.z - A.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    static footOfPerpendicular(P, A, B) {
        const AP = this.vectorFromPoints(A, P);
        const AB = this.vectorFromPoints(A, B);
        
        const t = this.dotProduct(AP, AB) / this.dotProduct(AB, AB);
        
        return {
            x: A.x + t * AB.x,
            y: A.y + t * AB.y,
            z: A.z + t * AB.z
        };
    }

    static lineIntersection(P1, v1, P2, v2) {
        // Tính vector nối giữa hai điểm
        const P1P2 = this.vectorFromPoints(P1, P2);
        
        // Tính vector pháp tuyến
        const n = this.crossProduct(v1, v2);
        const n2 = this.crossProduct(P1P2, v2);
        
        // Kiểm tra xem các đường có song song không
        if (this.vectorLength(n) < 1e-10) {
            return null; // Song song hoặc trùng
        }
        
        const t = this.dotProduct(n2, n) / this.dotProduct(n, n);
        
        return {
            x: P1.x + t * v1.x,
            y: P1.y + t * v1.y,
            z: P1.z + t * v1.z
        };
    }

    static planeFromPoints(A, B, C) {
        const AB = this.vectorFromPoints(A, B);
        const AC = this.vectorFromPoints(A, C);
        const normal = this.crossProduct(AB, AC);
        
        return {
            normal: this.normalizeVector(normal),
            point: A
        };
    }

    static isPointInTriangle(P, A, B, C) {
        // Kiểm tra xem điểm P có nằm trong tam giác ABC không
        const v0 = this.vectorFromPoints(A, C);
        const v1 = this.vectorFromPoints(A, B);
        const v2 = this.vectorFromPoints(A, P);

        const dot00 = this.dotProduct(v0, v0);
        const dot01 = this.dotProduct(v0, v1);
        const dot02 = this.dotProduct(v0, v2);
        const dot11 = this.dotProduct(v1, v1);
        const dot12 = this.dotProduct(v1, v2);

        const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
        const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
        const v = (dot00 * dot12 - dot01 * dot02) * invDenom;

        return (u >= 0) && (v >= 0) && (u + v <= 1);
    }
}
