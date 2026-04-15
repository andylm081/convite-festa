import requests
import sys
from datetime import datetime

class BirthdayInviteAPITester:
    def __init__(self, base_url="https://rsvp-brasil.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.guest_id = None
        self.guest_slug = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"   Response: {response.text}")
                except:
                    pass
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        success, _ = self.run_test(
            "Health Check",
            "GET",
            "health",
            200
        )
        return success

    def test_event_settings_public(self):
        """Test public event settings endpoint"""
        success, response = self.run_test(
            "Event Settings (Public)",
            "GET",
            "event-settings",
            200
        )
        if success and response:
            print(f"   Event: {response.get('title', 'N/A')}")
            print(f"   Date: {response.get('event_date', 'N/A')}")
        return success

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@festa.com", "password": "festa2024"}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_admin_me(self):
        """Test admin me endpoint"""
        success, response = self.run_test(
            "Admin Me",
            "GET",
            "auth/me",
            200
        )
        if success and response:
            print(f"   Admin email: {response.get('email', 'N/A')}")
        return success

    def test_guest_stats(self):
        """Test guest statistics"""
        success, response = self.run_test(
            "Guest Statistics",
            "GET",
            "guests/stats",
            200
        )
        if success and response:
            print(f"   Total: {response.get('total', 0)}")
            print(f"   Confirmed: {response.get('confirmed', 0)}")
            print(f"   Cancelled: {response.get('cancelled', 0)}")
            print(f"   Pending: {response.get('pending', 0)}")
        return success

    def test_create_guest(self):
        """Test creating a guest"""
        test_guest = {
            "full_name": f"Test Guest {datetime.now().strftime('%H%M%S')}",
            "nickname": "Testinho",
            "phone": "(11) 99999-9999",
            "notes": "Test guest for API testing"
        }
        success, response = self.run_test(
            "Create Guest",
            "POST",
            "guests",
            201,
            data=test_guest
        )
        if success and response:
            self.guest_id = response.get('id')
            self.guest_slug = response.get('slug')
            print(f"   Guest ID: {self.guest_id}")
            print(f"   Guest Slug: {self.guest_slug}")
            print(f"   Invite Link: {response.get('invite_link', 'N/A')}")
        return success

    def test_list_guests(self):
        """Test listing guests"""
        success, response = self.run_test(
            "List Guests",
            "GET",
            "guests",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} guests")
        return success

    def test_get_guest_by_slug(self):
        """Test getting guest by slug (public endpoint)"""
        if not self.guest_slug:
            print("❌ No guest slug available for testing")
            return False
        
        success, response = self.run_test(
            "Get Guest by Slug",
            "GET",
            f"rsvp/guest/{self.guest_slug}",
            200
        )
        if success and response:
            print(f"   Guest Name: {response.get('full_name', 'N/A')}")
            print(f"   Status: {response.get('status', 'N/A')}")
        return success

    def test_rsvp_confirm(self):
        """Test RSVP confirmation"""
        if not self.guest_slug:
            print("❌ No guest slug available for testing")
            return False
        
        success, response = self.run_test(
            "RSVP Confirm",
            "POST",
            "rsvp/confirm",
            200,
            data={"slug": self.guest_slug, "response_name": "Test Guest"}
        )
        if success and response:
            print(f"   Message: {response.get('message', 'N/A')}")
            print(f"   Status: {response.get('status', 'N/A')}")
        return success

    def test_rsvp_cancel(self):
        """Test RSVP cancellation"""
        if not self.guest_slug:
            print("❌ No guest slug available for testing")
            return False
        
        success, response = self.run_test(
            "RSVP Cancel",
            "POST",
            "rsvp/cancel",
            200,
            data={"slug": self.guest_slug, "response_name": "Test Guest"}
        )
        if success and response:
            print(f"   Message: {response.get('message', 'N/A')}")
            print(f"   Status: {response.get('status', 'N/A')}")
        return success

    def test_rsvp_public_confirm(self):
        """Test RSVP confirmation via public link"""
        success, response = self.run_test(
            "RSVP Public Confirm",
            "POST",
            "rsvp/confirm",
            200,
            data={"response_name": f"Public Test {datetime.now().strftime('%H%M%S')}"}
        )
        if success and response:
            print(f"   Message: {response.get('message', 'N/A')}")
        return success

    def test_rsvp_logs(self):
        """Test RSVP logs"""
        success, response = self.run_test(
            "RSVP Logs",
            "GET",
            "rsvp-logs",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} RSVP logs")
            if response:
                latest = response[0]
                print(f"   Latest: {latest.get('guest_name', 'N/A')} - {latest.get('action', 'N/A')}")
        return success

    def test_update_guest(self):
        """Test updating a guest"""
        if not self.guest_id:
            print("❌ No guest ID available for testing")
            return False
        
        success, response = self.run_test(
            "Update Guest",
            "PUT",
            f"guests/{self.guest_id}",
            200,
            data={"notes": "Updated test notes"}
        )
        if success and response:
            print(f"   Updated notes: {response.get('notes', 'N/A')}")
        return success

    def test_update_event_settings(self):
        """Test updating event settings"""
        success, response = self.run_test(
            "Update Event Settings",
            "PUT",
            "event-settings",
            200,
            data={"title": "Você foi convidado! (Updated)"}
        )
        if success and response:
            print(f"   Updated title: {response.get('title', 'N/A')}")
        return success

    def test_delete_guest(self):
        """Test deleting a guest"""
        if not self.guest_id:
            print("❌ No guest ID available for testing")
            return False
        
        success, response = self.run_test(
            "Delete Guest",
            "DELETE",
            f"guests/{self.guest_id}",
            200
        )
        if success and response:
            print(f"   Message: {response.get('message', 'N/A')}")
        return success

def main():
    print("🎉 Starting Birthday Invite API Tests")
    print("=" * 50)
    
    tester = BirthdayInviteAPITester()
    
    # Test sequence
    tests = [
        tester.test_health_check,
        tester.test_event_settings_public,
        tester.test_admin_login,
        tester.test_admin_me,
        tester.test_guest_stats,
        tester.test_create_guest,
        tester.test_list_guests,
        tester.test_get_guest_by_slug,
        tester.test_rsvp_confirm,
        tester.test_rsvp_logs,
        tester.test_rsvp_cancel,
        tester.test_rsvp_public_confirm,
        tester.test_update_guest,
        tester.test_update_event_settings,
        tester.test_delete_guest,
    ]
    
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test {test.__name__} failed with exception: {str(e)}")
    
    print("\n" + "=" * 50)
    print(f"📊 Tests completed: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("❌ Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())