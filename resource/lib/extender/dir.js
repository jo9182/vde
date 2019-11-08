module.exports = {
    getFiles(path, tree, depth = 1) {
        if (path === "/") return tree;

        let pathTuple = path.split("/");
        if (pathTuple.length === depth) return tree;
        for (let i = 0; i < tree.length; i++)
            if (tree[i].isFolder && tree[i].name === pathTuple[depth])
                return this.getFiles(path, tree[i].files, depth + 1);
        return [];
    }
};