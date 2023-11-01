export class Digraph {
    constructor(V) {
        if (V < 0)
            throw new Error("Number of vertices in a Diagprah must be non-negative");
        this.V = V;
        this.E = 0;
        this.indegree = new Array(V).fill(0);
        this.adj = [];
        for (let v = 0; v < V; v++) {
            this.adj.push([]);
        }
    }
    dfs(start) {
        const visited = new Array(this.V).fill(false);
        const dfsList = [];
        function recursion(list, vert) {
            list.push(vert);
            visited[vert] = true;
            for (let i = 0; i < this.adj[vert].length; i++) {
                if (visited[this.adj[vert][i]])
                    return;
                recursion.call(this, list, this.adj[vert][i]);
            }
        }
        recursion.call(this, dfsList, start);
        return dfsList;
    }
    topologicalSort() {
        // Define recursion function
        function topologicalRecursion(start, visited, stack) {
            visited[start] = true;
            for (let i = 0; i < this.adj[start].length; i++) {
                const vertex = this.adj[start][i];
                if (!visited[vertex]) {
                    topologicalRecursion.call(this, vertex, visited, stack);
                }
            }
            stack.push(start);
        }
        // Start procedure
        const visited = new Array(this.V).fill(false);
        const stack = [];
        /*
        let vertices = Array.from({length: this.V}, (_, i) => i);
        vertices.sort((a, b) => this.adj[b].length - this.adj[a].length);
        */
        for (let i = 0; i < this.V; i++) {
            if (!visited[i]) {
                console.log(stack);
                topologicalRecursion.call(this, i, visited, stack);
            }
        }
        return stack;
    }
    addEdge(v, w) {
        this.validateVertex(v);
        this.validateVertex(w);
        this.adj[v].unshift(w);
        this.indegree[w]++;
        this.E++;
    }
    // returns this graph but reversed
    reverse() {
        const reverse = new Digraph(this.V);
        for (let v = 0; v < this.V; v++) {
            for (const w of this.adj[v]) {
                reverse.addEdge(w, v);
            }
        }
        return reverse;
    }
    outdegree(v) {
        this.validateVertex(v);
        return this.adj[v].length;
    }
    indegree(v) {
        this.validateVertex(v);
        return this.indegree[v];
    }
    // string representation
    toString() {
        let s = `${this.V} vertices, ${this.E} edges \n`;
        for (let v = 0; v < this.V; v++) {
            s += `${v}: `;
            for (const w of this.adj[v]) {
                s += `${w} `;
            }
            s += `\n`;
        }
        return s;
    }
    validateVertex(v) {
        if (v < 0 || v >= this.V) {
            throw new Error(`vertex ${v} is not between 0 and ${this.V - 1}`);
        }
    }
}
//# sourceMappingURL=Digraph.js.map