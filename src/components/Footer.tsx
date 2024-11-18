const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
      <div className="items-centers grid grid-cols-1 justify-between gap-4 border-t border-gray-200 py-6 md:grid-cols-2">
        <p className="text-sm/6 text-slate-600 max-md:text-center">
          © <span id="year">{year}</span> BOSCO Beauty Clinic
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm/6 font-semibold text-slate-900 md:justify-end">
          <a href="/privacy-policy">Polityka prywatności</a>
          <div className="h-4 w-px bg-slate-200"></div>
          <a href="/changelog">Regulamin</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
