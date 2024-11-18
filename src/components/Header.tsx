const Header = () => {
  return (
    <header>
      <div
        className="mx-auto border-b flex max-w-6xl items-center justify-between p-4"
        aria-label="header"
      >
        <div className="flex lg:flex-1">
          <a href="#" className="-m-1.5 p-1.5">
            <span className="sr-only">Bosco Beauty Clinic logo</span>
            <img className="h-8 w-auto" src="logo_poziom-1.svg" alt="" />
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
