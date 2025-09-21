describe('Health endpoint', () => {
  it('returns ok: true', () => {
    cy.request('/health').its('status').should('eq', 200);
    cy.request('/health').its('body').should('deep.equal', { ok: true });
  });
});
