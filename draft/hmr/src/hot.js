// Hot reload api
const InstanceData = {};

export const Hot = (mod, component) => {
  if (mod.hot) {
    mod.hot.accept();

    if (!mod.hot.data) {
      // Whenever code executes for the first time
    } else {
      // Reload instances
      const instances = InstanceData[mod.id];
      instances.forEach(([instance, args], index) => {
        const newInstance = component(...args);
        instance.reloadWith(newInstance);
        instances[index][0] = newInstance;
      });
    }

    return (...args) => {
      const modId = mod.id;
      if (!InstanceData[modId]) InstanceData[modId] = [];
      const instances = InstanceData[modId];
      const instance = component(...args);
      instances.push([instance, args]);
      return instance;
    }
  }

  return component;
}
