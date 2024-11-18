import { Toaster } from "sonner";
import Footer from "./components/Footer";
import FormContainer from "./components/Form";
import Header from "./components/Header";

function App() {
  return (
    <>
      <Toaster richColors />
      <div
        className="grid h-max min-h-dvh w-full grid-cols-1"
        style={{
          gridTemplateRows: "auto 1fr auto",
        }}
      >
        <Header />
        <FormContainer />
        <Footer />
      </div>
    </>
  );
}

export default App;
