/**
 * Django Integration Test Page
 *
 * Navigate to http://localhost:3000/test-django to test the Django backend integration
 */

import DjangoChatExample from '../components/DjangoChatExample';

export default function TestDjangoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <DjangoChatExample />
    </main>
  );
}
