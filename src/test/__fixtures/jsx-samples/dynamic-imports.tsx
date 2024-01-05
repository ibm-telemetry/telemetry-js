/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @ts-nocheck
import React, { useState } from 'react';

export default function App() {
  const [bla, setBla] = useState('');

  async function awaitImportDefault() {
    const carbon = await import('@carbon/react');
    setBla(<carbon.Button>Another Carbon Button</carbon.Button>);
  }

  function importPromiseDefault() {
    import('@carbon/react').then((carbon) => {
      setBla(<carbon.Button>A Button</carbon.Button>);
    });
  }

  function aCallbackFunction(carbon) {
    setBla(<carbon.Button>A Button from a function</carbon.Button>);
  }

  function importPromiseDestructured() {
    import('@carbon/react').then(({ Button, Accordion }) => {
      setBla(<Button>A Button Button Button</Button>);
    });
  }

  async function awaitImportDestructured() {
    const {
      Button,
      default: Bla,
      Accordion: Ble,
      AccordionItem,
    } = await import('@carbon/react');
    setBla(
      <>
        <Button>destructured named import await </Button>
        <Ble>
          <AccordionItem>Hii</AccordionItem>
        </Ble>
      </>
    );
  }

  function importWithCallback() {
    import('@carbon/react').then(aFunctionToCall);
  }

  async function awaitImportWithPropertyAccessDefault() {
    const carbon = (await import('@carbon/react')).default;
    setBla(<carbon.Button>ble</carbon.Button>);
  }


  async function awaitImportWithPropertyAccessDestructuredDefault() {
    const {Button, default: RenamedDefault, Accordion: RenamedAccordion} = (await import('@carbon/react')).default;
    setBla(<carbon.Button>ble</carbon.Button>);
  }

  async function awaitImportWithPropertyAccessDestructured() {
    const Button = (await import('@carbon/react')).Button;
    setBla(<Button>await import .button</Button>);
  }

  return bla;
}
