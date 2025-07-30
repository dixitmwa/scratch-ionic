const SafeAreaView: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
    }}
  >
    {children}
  </div>
);

export default SafeAreaView;