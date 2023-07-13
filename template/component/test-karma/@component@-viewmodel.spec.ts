import * as sinon from "sinon";
import ViewModel from "@component-name@/@component-name@-viewModel";
import "@component-name@/loader";

declare const expect: Chai.ExpectStatic;

describe("View-model sample test tests", () => {
  it("sampleTest variables should be equal to the value assigned to", () => {
    const sampleTest = 'My sample test';
    expect(sampleTest).to.equal('My sample test');
  });
});
