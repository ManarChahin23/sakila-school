describe('Auth guard', () => {
  it('redirects /users to /auth/login when not logged in', () => {
    cy.visit('/users', { failOnStatusCode: false });  // laat 302/redirect passeren
    cy.location('pathname').should('include', '/auth/login');
  });
});
