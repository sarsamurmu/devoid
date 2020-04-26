const InstanceData = {};

module.exports.Hot = (mod, component) => {
  if (process.env.NODE_ENV !== 'production') {
    if (mod.hot) {
      const compId = `${mod.id} ${component.name}`;
      const reloadInstances = () => {
        const instances = InstanceData[compId];
        instances.forEach(([instance, args], index) => {
          const newInstance = component(...args);
          instance.reloadWith(newInstance);
          instances[index][0] = newInstance;
        });
      }

      mod.hot.accept(reloadInstances);

      if (mod.hot.data) {
        // Reload instances
        reloadInstances();
      } else {
        // Whenever code executes for the first time
      }

      return (...args) => {
        if (!InstanceData[compId]) InstanceData[compId] = [];
        const instances = InstanceData[compId];
        const instance = component(...args);
        instances.push([instance, args]);
        return instance;
      }
    }
  }

  return component;
}
