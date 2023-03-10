import React from 'react';
import { Path, FieldObject } from './Field';
import { useField } from './Paginator';

interface OutletContextObject {
  outlet: JSX.Element | null;
  path: Path | null;
  reference: ((arg: Element | null) => void) | null;
}

const OutletContext = React.createContext<OutletContextObject>({
  outlet: null,
  path: null,
  reference: null,
});

export function useOutlet(): OutletContextObject {
  return React.useContext(OutletContext);
}

export function Outlet(): OutletContextObject['outlet'] {
  return useOutlet().outlet;
}

interface OutletProviderProps {
  path: Path;
  outlet: JSX.Element | null;
  children: React.ReactNode | null;
}

export function OutletProvider({ path, outlet, children }: OutletProviderProps): JSX.Element {
  const [ref, setRef] = React.useState<Element | null>(null);

  const { subField } = useField();

  React.useLayoutEffect(() => {
    if (ref && subField) return subField(ref, path);
  }, [path, ref, subField]);

  const reference = React.useCallback(
    (el: Element | null) => {
      if (el && el !== ref) setRef(el);
    },
    [ref],
  );

  return (
    <OutletContext.Provider value={{ outlet, reference, path }}>{children}</OutletContext.Provider>
  );
}

export function renderWithOutlet(structure: FieldObject, path: Path = []): JSX.Element {
  const { element, children } = structure;
  const outlets: React.ReactNode[] = [];
  if (children) {
    children.forEach((child, index) => {
      outlets.push(renderWithOutlet(child, [...path, index]));
    });
  }

  const outlet = <>{outlets}</>;

  return (
    <OutletProvider path={path} outlet={outlet} key={path.join('.')}>
      {element}
    </OutletProvider>
  );
}
