from django.db.utils import OperationalError
from django.test import TestCase
from mock import patch

from kolibri.core.discovery.models import NetworkLocation
from kolibri.core.discovery.upgrade import move_network_location_entries
from kolibri.deployment.default.sqlite_db_names import NETWORK_LOCATION


class TestNetworkLocationUpgrade(TestCase):
    multi_db = True

    def test_successful_move_locations(self):

        locations = [NetworkLocation(base_url="example.com")]
        with patch(
            "kolibri.core.discovery.upgrade.NetworkLocation"
        ) as mock_model, patch(
            "kolibri.core.discovery.upgrade.connection"
        ) as mock_connection:
            mock_model.objects.using().all.return_value = locations
            mock_model._meta = NetworkLocation._meta
            move_network_location_entries()
            mock_model.objects.using(NETWORK_LOCATION).bulk_create.assert_called_with(
                locations
            )
            mock_connection.cursor().execute.assert_called_with(
                "DROP TABLE {}".format(NetworkLocation._meta.db_table)
            )

    def test_default_db_no_migration(self):
        try:
            move_network_location_entries()
        except OperationalError:
            self.fail(
                "Got an OperationalError while trying to upgrade NetworkLocation data"
            )
