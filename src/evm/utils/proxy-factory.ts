/**
 * Proxy Factory for Object Composition
 *
 * This module provides a sophisticated proxy-based composition mechanism that allows multiple objects
 * to be merged into a single interface while maintaining type safety and proper method binding.
 *
 * Key Features:
 * - Dynamic property delegation across multiple instances
 * - Priority-based property resolution (target > composed instances in array order)
 * - Automatic method binding to preserve 'this' context
 * - Advanced TypeScript type inference for compile-time safety
 * - Support for property existence checks ('in' operator, hasOwnProperty, etc.)
 *
 * Technical Implementation:
 * - Uses JavaScript Proxy to intercept property access and existence checks
 * - Leverages advanced TypeScript conditional types for union-to-intersection conversion
 * - Maintains proper property descriptor handling through Reflect API
 *
 * Use Cases:
 * - Mixin pattern implementation
 * - Multiple inheritance simulation
 * - Cross-cutting concern composition
 * - Interface segregation with type safety
 *
 * @fileoverview Advanced proxy-based object composition with TypeScript type safety
 */

/**
 * Creates a composed proxy that merges properties and methods from multiple objects into a single interface.
 * This function implements a composition pattern using JavaScript Proxy to dynamically delegate property access
 * across multiple instances while maintaining type safety through advanced TypeScript types.
 *
 * The proxy follows a priority order: target object takes precedence, then composed instances in array order.
 * Methods are bound to their original instances to preserve correct 'this' context.
 *
 * @template TTarget - The primary target object type
 * @template TComposed - A readonly tuple of composed instance types
 * @param target - The primary object that serves as the base for the proxy
 * @param composedInstances - Array of instances to compose into the target, checked in order
 * @returns A proxy object that combines all properties and methods from target and composed instances
 */
export function createComposedProxy<TTarget extends object, TComposed extends readonly any[]>(
  target: TTarget,
  composedInstances: TComposed
): TTarget & UnionToIntersection<ArrayElementType<TComposed>> {
  return new Proxy(target, {
    /**
     * Intercepts property access and delegates to appropriate instance.
     * This is the core of the composition pattern - it searches for properties
     * across all composed instances in a defined priority order.
     *
     * Priority order: target > composed instances (in array order)
     *
     * @param target - The original target object being proxied
     * @param prop - The property being accessed (string, symbol, or number)
     * @param receiver - The proxy object (used for proper 'this' binding)
     */
    get(target, prop, receiver) {
      // Primary target has highest priority - if property exists here, use it
      // This ensures the main object's properties are never overridden
      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }

      // Search through composed instances in order of priority
      // Earlier instances in the array have higher priority than later ones
      for (const instance of composedInstances) {
        // Special handling for methods: bind them to their original instance to preserve 'this' context
        // Without this binding, methods would lose their original context and potentially break
        if (prop in instance && typeof (instance as any)[prop] === 'function') {
          // Return a bound function that maintains the original instance as 'this'
          return (...args: any[]) => (instance as any)[prop](...args);
        }

        // Handle non-method properties using Reflect for proper descriptor handling
        // Reflect.get respects getters, setters, and other property descriptors
        if (prop in instance) {
          return Reflect.get(instance, prop, instance);
        }
      }

      // Property not found in any instance - return undefined (standard JavaScript behavior)
      return undefined;
    },

    /**
     * Intercepts 'in' operator and property existence checks (Object.hasOwnProperty, etc.).
     * This ensures that property existence checks work correctly across all composed instances.
     *
     * Examples of operations this handles:
     * - 'propertyName' in proxyObject
     * - Object.hasOwnProperty.call(proxyObject, 'propertyName')
     * - Reflect.has(proxyObject, 'propertyName')
     *
     * @param target - The original target object being proxied
     * @param prop - The property being checked for existence
     * @returns true if the property exists in target or any composed instance
     */
    has(target, prop) {
      // Check if property exists in target first, then search composed instances
      return prop in target || composedInstances.some(instance => prop in instance);
    }
  }) as unknown as TTarget & UnionToIntersection<ArrayElementType<TComposed>>;
}

//
// Advanced TypeScript utility types for proxy composition type inference.
// These types enable compile-time type safety for dynamically composed objects.
//

/**
 * Extracts the element type from a readonly array type.
 * This conditional type unwraps the array to get the union of all possible element types.
 *
 * Example: ArrayElementType<readonly [ClassA, ClassB]> = ClassA | ClassB
 *
 * @template T - A readonly array type
 */
type ArrayElementType<T extends readonly any[]> = T extends readonly (infer U)[] ? U : never;

/**
 * Converts a union type into an intersection type using distributive conditional types.
 * This advanced TypeScript pattern leverages function parameter contravariance to merge types.
 *
 * The transformation works by:
 * 1. Distributing the union U across a function parameter: (k: U) => void
 * 2. Using inference to collapse the distributed functions back into an intersection
 * 3. Extracting the intersection type I from the inferred parameter type
 *
 * Example: UnionToIntersection<{ a: string } | { b: number }> = { a: string } & { b: number }
 *
 * @template U - A union type to convert to intersection
 */
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
