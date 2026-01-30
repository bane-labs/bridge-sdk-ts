export function createComposedProxy<TTarget extends object, TComposed extends readonly any[]>(
  target: TTarget,
  composedInstances: TComposed
): TTarget & UnionToIntersection<ArrayElementType<TComposed>> {
  return new Proxy(target, {
    get(target, prop, receiver) {
      // If the property exists on the target, use it
      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }

      // Check composed instances in order
      for (const instance of composedInstances) {
        if (prop in instance && typeof (instance as any)[prop] === 'function') {
          return (...args: any[]) => (instance as any)[prop](...args);
        }

        if (prop in instance) {
          return Reflect.get(instance, prop, instance);
        }
      }

      return undefined;
    },

    has(target, prop) {
      return prop in target || composedInstances.some(instance => prop in instance);
    }
  }) as unknown as TTarget & UnionToIntersection<ArrayElementType<TComposed>>;
}

// Helper types for the proxy composition
type ArrayElementType<T extends readonly any[]> = T extends readonly (infer U)[] ? U : never;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
